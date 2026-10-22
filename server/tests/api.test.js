import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/db.js";
import { signToken } from "../src/utils/auth.js";

describe("Phase 6E: Core REST APIs Test Suite", () => {
  // Test authentication tokens
  const ownerUser = { id: "user-owner", email: "owner@example.com", name: "Owner User" };
  const adminUser = { id: "user-admin", email: "admin@example.com", name: "Admin User" };
  const memberUser = { id: "user-member", email: "member@example.com", name: "Member User" };
  const outsiderUser = { id: "user-outsider", email: "outsider@example.com", name: "Outsider User" };

  const ownerToken = signToken(ownerUser);
  const adminToken = signToken(adminUser);
  const memberToken = signToken(memberUser);
  const outsiderToken = signToken(outsiderUser);

  const testWorkspaceId = "ws-test-100";
  const testProjectId = "proj-test-200";
  const testTaskId = "task-test-300";

  beforeEach(() => {
    // Reset prisma mock stubs
    prisma.user = {
      findUnique: async ({ where }) => {
        if (where.id === ownerUser.id) return ownerUser;
        if (where.id === adminUser.id) return adminUser;
        if (where.id === memberUser.id) return memberUser;
        if (where.id === outsiderUser.id) return outsiderUser;
        if (where.email === "new@example.com") return { id: "user-new", email: "new@example.com", name: "New User" };
        return null;
      },
    };

    prisma.workspace = {
      findUnique: async ({ where }) => {
        if (where.id === testWorkspaceId) {
          return {
            id: testWorkspaceId,
            name: "Test Corp",
            slug: "test-corp",
            description: "Test Workspace",
            ownerId: ownerUser.id,
            members: [],
            projects: [],
          };
        }
        return null;
      },
      create: async ({ data }) => ({
        id: "ws-new-123",
        ...data,
      }),
      update: async ({ where, data }) => ({
        id: where.id,
        name: data.name || "Updated Workspace",
        description: data.description || null,
      }),
      delete: async () => ({ id: testWorkspaceId }),
    };

    prisma.workspaceMember = {
      findMany: async ({ where }) => {
        if (where.userId === ownerUser.id) {
          return [
            {
              workspaceId: testWorkspaceId,
              userId: ownerUser.id,
              role: "OWNER",
              workspace: { id: testWorkspaceId, name: "Test Corp", _count: { projects: 1, members: 3 } },
            },
          ];
        }
        if (where.workspaceId === testWorkspaceId) {
          return [
            { id: "wm-1", userId: ownerUser.id, role: "OWNER", user: ownerUser },
            { id: "wm-2", userId: adminUser.id, role: "ADMIN", user: adminUser },
            { id: "wm-3", userId: memberUser.id, role: "MEMBER", user: memberUser },
          ];
        }
        return [];
      },
      findUnique: async ({ where }) => {
        const query = where.userId_workspaceId;
        if (!query) return null;

        if (query.workspaceId === testWorkspaceId) {
          if (query.userId === ownerUser.id) return { id: "wm-1", userId: ownerUser.id, workspaceId: testWorkspaceId, role: "OWNER" };
          if (query.userId === adminUser.id) return { id: "wm-2", userId: adminUser.id, workspaceId: testWorkspaceId, role: "ADMIN" };
          if (query.userId === memberUser.id) return { id: "wm-3", userId: memberUser.id, workspaceId: testWorkspaceId, role: "MEMBER" };
        }
        return null;
      },
      create: async ({ data }) => ({
        id: "wm-new",
        ...data,
        user: { id: data.userId, name: "Added User", email: "added@example.com" },
      }),
      update: async ({ data }) => ({
        id: "wm-updated",
        role: data.role,
        user: memberUser,
      }),
      delete: async () => ({ id: "wm-deleted" }),
    };

    prisma.project = {
      findMany: async () => [
        {
          id: testProjectId,
          name: "LaunchPad",
          description: "CRM App",
          status: "ACTIVE",
          priority: "HIGH",
          workspaceId: testWorkspaceId,
          tasks: [],
          members: [],
          _count: { tasks: 1, members: 2 },
        },
      ],
      findUnique: async ({ where }) => {
        if (where.id === testProjectId) {
          return {
            id: testProjectId,
            name: "LaunchPad",
            workspaceId: testWorkspaceId,
            team_lead: ownerUser.id,
            tasks: [],
            members: [],
            workspace: { id: testWorkspaceId },
          };
        }
        return null;
      },
      create: async ({ data }) => ({
        id: "proj-new-789",
        name: data.name,
        workspaceId: data.workspaceId,
        status: data.status,
        priority: data.priority,
        team_lead: data.team_lead,
      }),
      update: async ({ data }) => ({
        id: testProjectId,
        name: data.name || "Updated Project",
      }),
      delete: async () => ({ id: testProjectId }),
    };

    prisma.projectMember = {
      findUnique: async () => null,
      create: async ({ data }) => ({ id: "pm-new", ...data }),
    };

    prisma.task = {
      findMany: async () => [
        {
          id: testTaskId,
          projectId: testProjectId,
          title: "Setup Auth",
          status: "TODO",
          type: "FEATURE",
          priority: "HIGH",
          assignee: ownerUser,
          project: {
            workspaceId: testWorkspaceId,
          },
          _count: { comments: 0 },
        },
      ],
      findUnique: async ({ where }) => {
        if (where.id === testTaskId) {
          return {
            id: testTaskId,
            projectId: testProjectId,
            title: "Setup Auth",
            status: "TODO",
            project: {
              id: testProjectId,
              name: "LaunchPad",
              workspaceId: testWorkspaceId,
              workspace: { id: testWorkspaceId },
            },
            assignee: ownerUser,
            comments: [],
          };
        }
        return null;
      },
      create: async ({ data }) => ({
        id: "task-new-555",
        ...data,
        assignee: null,
        _count: { comments: 0 },
      }),
      update: async ({ data }) => ({
        id: testTaskId,
        title: data.title || "Updated Task",
        status: data.status || "DONE",
      }),
      delete: async () => ({ id: testTaskId }),
      deleteMany: async ({ where }) => ({ count: where.id.in.length }),
    };

    prisma.comment = {
      findMany: async () => [
        {
          id: "comm-1",
          taskId: testTaskId,
          userId: ownerUser.id,
          content: "Initial comment",
          createdAt: new Date(),
          user: ownerUser,
        },
      ],
      create: async ({ data }) => ({
        id: "comm-new",
        taskId: data.taskId,
        userId: data.userId,
        content: data.content,
        user: ownerUser,
      }),
    };

    prisma.$transaction = async (callback) => {
      if (typeof callback === "function") {
        return callback(prisma);
      }
      return callback;
    };
  });

  // ==========================================
  // 1. Workspace APIs Tests
  // ==========================================
  describe("Workspace APIs", () => {
    it("GET /api/workspaces returns only workspaces where user is a member", async () => {
      const res = await request(app)
        .get("/api/workspaces")
        .set("Authorization", `Bearer ${ownerToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.length, 1);
      assert.strictEqual(res.body.data[0].id, testWorkspaceId);
      assert.strictEqual(res.body.data[0].currentUserRole, "OWNER");
    });

    it("POST /api/workspaces creates workspace and assigns requester as OWNER", async () => {
      const res = await request(app)
        .post("/api/workspaces")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "Alpha Ventures", description: "Venture arm" });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.name, "Alpha Ventures");
      assert.strictEqual(res.body.data.ownerId, ownerUser.id);
    });

    it("GET /api/workspaces/:id rejects non-members with 403 Forbidden", async () => {
      const res = await request(app)
        .get(`/api/workspaces/${testWorkspaceId}`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /not a member of this workspace/);
    });

    it("PATCH /api/workspaces/:id allows OWNER and ADMIN to update details", async () => {
      const res = await request(app)
        .patch(`/api/workspaces/${testWorkspaceId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Renamed Corp" });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.name, "Renamed Corp");
    });

    it("PATCH /api/workspaces/:id rejects standard MEMBER with 403 Forbidden", async () => {
      const res = await request(app)
        .patch(`/api/workspaces/${testWorkspaceId}`)
        .set("Authorization", `Bearer ${memberToken}`)
        .send({ name: "Hacked Corp" });

      assert.strictEqual(res.status, 403);
      assert.match(res.body.message, /Insufficient permissions/);
    });

    it("DELETE /api/workspaces/:id permits OWNER and blocks ADMIN", async () => {
      // ADMIN blocked
      const adminRes = await request(app)
        .delete(`/api/workspaces/${testWorkspaceId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      assert.strictEqual(adminRes.status, 403);

      // OWNER permitted
      const ownerRes = await request(app)
        .delete(`/api/workspaces/${testWorkspaceId}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      assert.strictEqual(ownerRes.status, 200);
      assert.strictEqual(ownerRes.body.success, true);
    });
  });

  // ==========================================
  // 2. Workspace Member APIs Tests
  // ==========================================
  describe("Workspace Member APIs", () => {
    it("POST /api/workspaces/:id/members adds existing user by email", async () => {
      const origFind = prisma.user.findUnique;
      prisma.user.findUnique = async ({ where }) => {
        if (where.email === "new@example.com") return { id: "user-new", email: "new@example.com" };
        return origFind({ where });
      };

      const res = await request(app)
        .post(`/api/workspaces/${testWorkspaceId}/members`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ email: "new@example.com", role: "MEMBER" });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.userId, "user-new");
    });

    it("POST /api/workspaces/:id/members returns 404 if email does not exist", async () => {
      const origFind = prisma.user.findUnique;
      prisma.user.findUnique = async ({ where }) => {
        if (where.email === "missing@example.com") return null;
        return origFind({ where });
      };

      const res = await request(app)
        .post(`/api/workspaces/${testWorkspaceId}/members`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ email: "missing@example.com", role: "MEMBER" });

      assert.strictEqual(res.status, 404);
      assert.match(res.body.message, /User not found/);
    });

    it("PATCH /api/workspaces/:id/members/:userId blocks altering OWNER role", async () => {
      prisma.workspaceMember.findUnique = async () => ({
        id: "wm-1",
        userId: ownerUser.id,
        role: "OWNER",
      });

      const res = await request(app)
        .patch(`/api/workspaces/${testWorkspaceId}/members/${ownerUser.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "MEMBER" });

      assert.strictEqual(res.status, 403);
      assert.match(res.body.message, /Cannot alter the role of the workspace OWNER/);
    });
  });

  // ==========================================
  // 3. Project APIs Tests
  // ==========================================
  describe("Project APIs", () => {
    it("GET /api/workspaces/:workspaceId/projects returns workspace projects with statistics", async () => {
      const res = await request(app)
        .get(`/api/workspaces/${testWorkspaceId}/projects`)
        .set("Authorization", `Bearer ${memberToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data[0].id, testProjectId);
    });

    it("GET /api/projects/:id blocks cross-workspace IDOR access for non-members", async () => {
      const res = await request(app)
        .get(`/api/projects/${testProjectId}`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      assert.strictEqual(res.status, 403);
      assert.match(res.body.message, /not a member of the workspace owning this project/);
    });

    it("POST /api/workspaces/:workspaceId/projects validates team lead belongs to workspace", async () => {
      // Mock lead not found in workspace
      const origFindUnique = prisma.workspaceMember.findUnique;
      prisma.workspaceMember.findUnique = async ({ where }) => {
        if (where.userId_workspaceId?.userId === "unknown-user") return null;
        return origFindUnique({ where });
      };

      const res = await request(app)
        .post(`/api/workspaces/${testWorkspaceId}/projects`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Project with bad lead",
          team_lead: "unknown-user",
        });

      assert.strictEqual(res.status, 400);
      assert.match(res.body.message, /must be a member of this workspace/);
    });
  });

  // ==========================================
  // 4. Task APIs Tests
  // ==========================================
  describe("Task APIs", () => {
    it("GET /api/projects/:projectId/tasks returns task list for authorized member", async () => {
      const res = await request(app)
        .get(`/api/projects/${testProjectId}/tasks`)
        .set("Authorization", `Bearer ${memberToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data[0].id, testTaskId);
    });

    it("POST /api/projects/:projectId/tasks validates title is required", async () => {
      const res = await request(app)
        .post(`/api/projects/${testProjectId}/tasks`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "" });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Validation failed/);
    });

    it("POST /api/tasks/batch-delete atomically deletes tasks when authorized", async () => {
      const res = await request(app)
        .post("/api/tasks/batch-delete")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ taskIds: [testTaskId] });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.count, 1);
    });
  });

  // ==========================================
  // 5. Comment APIs Tests
  // ==========================================
  describe("Comment APIs", () => {
    it("POST /api/tasks/:taskId/comments derives author from authenticated token", async () => {
      const res = await request(app)
        .post(`/api/tasks/${testTaskId}/comments`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ content: "Great progress on this feature!" });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.userId, ownerUser.id);
      assert.strictEqual(res.body.data.content, "Great progress on this feature!");
    });

    it("POST /api/tasks/:taskId/comments rejects empty content with 400 Bad Request", async () => {
      const res = await request(app)
        .post(`/api/tasks/${testTaskId}/comments`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ content: "   " });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Validation failed/);
    });

    it("GET /api/tasks/:taskId/comments blocks outsiders with 403 Forbidden", async () => {
      const res = await request(app)
        .get(`/api/tasks/${testTaskId}/comments`)
        .set("Authorization", `Bearer ${outsiderToken}`);

      assert.strictEqual(res.status, 403);
      assert.match(res.body.message, /not a member of the workspace owning this task/);
    });
  });
});

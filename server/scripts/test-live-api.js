import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/db.js";

async function runLiveVerification() {
  console.log("=================================================");
  console.log("   PHASE 6J: LIVE POSTGRESQL API VERIFICATION   ");
  console.log("   Target Database: Neon Cloud PostgreSQL       ");
  console.log("=================================================\n");

  const createdUserIds = [];
  const createdWorkspaceIds = [];

  const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const userAData = {
    name: `Alice LiveTest`,
    email: `alice_${uniqueSuffix}@example.com`,
    password: `P@ssword_${uniqueSuffix}`,
  };

  const userBData = {
    name: `Bob LiveTest`,
    email: `bob_${uniqueSuffix}@example.com`,
    password: `P@ssword_${uniqueSuffix}`,
  };

  let tokenA = null;
  let tokenB = null;
  let userAId = null;
  let userBId = null;
  let workspaceId = null;
  let projectId = null;
  let taskId = null;
  let commentId = null;

  try {
    // -------------------------------------------------------------
    // 1. User Registration & Safe User Serialization
    // -------------------------------------------------------------
    console.log("1. Testing User Registration (POST /api/auth/register)...");
    const regResA = await request(app)
      .post("/api/auth/register")
      .send(userAData)
      .expect(201);

    assert(regResA.body.success === true, "Registration A success must be true");
    assert(regResA.body.data.token, "Registration A must return JWT token");
    assert(regResA.body.data.user.id, "Registration A must return user ID");
    assert.strictEqual(regResA.body.data.user.email, userAData.email);
    assert.strictEqual(regResA.body.data.user.passwordHash, undefined, "User response must NEVER expose passwordHash");
    assert.strictEqual(regResA.body.data.user.password, undefined, "User response must NEVER expose plaintext password");

    tokenA = regResA.body.data.token;
    userAId = regResA.body.data.user.id;
    createdUserIds.push(userAId);
    console.log(`   ✔ User A registered: ID=${userAId}, Email=${userAData.email}`);

    // Register User B
    const regResB = await request(app)
      .post("/api/auth/register")
      .send(userBData)
      .expect(201);

    tokenB = regResB.body.data.token;
    userBId = regResB.body.data.user.id;
    createdUserIds.push(userBId);
    console.log(`   ✔ User B registered: ID=${userBId}, Email=${userBData.email}`);

    // Duplicate registration check
    const dupRes = await request(app)
      .post("/api/auth/register")
      .send(userAData)
      .expect(409);
    assert.strictEqual(dupRes.body.success, false);
    console.log("   ✔ Duplicate registration rejected with 409 Conflict");

    // -------------------------------------------------------------
    // 2. Direct Database Inspection: Password Hashing in Neon
    // -------------------------------------------------------------
    console.log("\n2. Inspecting Persisted Password Hash in Neon...");
    const dbUserA = await prisma.user.findUnique({
      where: { id: userAId },
    });
    assert(dbUserA, "User A must exist in Neon PostgreSQL");
    assert(dbUserA.passwordHash.startsWith("$2"), "Password in Neon must be a bcrypt hash");
    assert.notStrictEqual(dbUserA.passwordHash, userAData.password, "Plaintext password must never be stored");
    console.log("   ✔ Confirmed in Neon: Password is securely bcrypt-hashed");

    // -------------------------------------------------------------
    // 3. User Login & Token Authentication
    // -------------------------------------------------------------
    console.log("\n3. Testing User Login (POST /api/auth/login)...");
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: userAData.email, password: userAData.password })
      .expect(200);

    assert(loginRes.body.data.token, "Login must return JWT token");
    assert.strictEqual(loginRes.body.data.user.passwordHash, undefined, "Login response must not expose passwordHash");
    console.log("   ✔ Valid login succeeded with signed JWT");

    // Invalid login
    await request(app)
      .post("/api/auth/login")
      .send({ email: userAData.email, password: "WrongPassword123!" })
      .expect(401);
    console.log("   ✔ Invalid password rejected with 401 Unauthorized");

    // Profile retrieval with token
    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);
    assert.strictEqual(meRes.body.data.user.id, userAId);
    console.log("   ✔ GET /api/auth/me returned authentic identity");

    // -------------------------------------------------------------
    // 4. Workspace Creation & Retrieval (User A)
    // -------------------------------------------------------------
    console.log("\n4. Testing Workspace Creation & Retrieval...");
    const wsRes = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        name: `Neon Workspace ${uniqueSuffix}`,
        description: "Created during Phase 6J live verification",
      })
      .expect(201);

    workspaceId = wsRes.body.data.id;
    createdWorkspaceIds.push(workspaceId);
    console.log(`   ✔ Workspace created: ID=${workspaceId}`);

    // List workspaces for User A
    const listWsResA = await request(app)
      .get("/api/workspaces")
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);

    const foundWs = listWsResA.body.data.find((w) => w.id === workspaceId);
    assert(foundWs, "Created workspace must appear in User A's workspace list");
    assert.strictEqual(foundWs.currentUserRole, "OWNER", "Creator must have OWNER role");
    console.log("   ✔ User A lists workspace with role OWNER");

    // -------------------------------------------------------------
    // 5. Workspace Isolation: User B Cannot Access User A's Workspace
    // -------------------------------------------------------------
    console.log("\n5. Testing Workspace Isolation (Cross-Tenant Defense)...");
    const listWsResB = await request(app)
      .get("/api/workspaces")
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(200);

    const bHasWs = listWsResB.body.data.some((w) => w.id === workspaceId);
    assert.strictEqual(bHasWs, false, "User B must not see User A's workspace in list");

    // Direct access attempt by outsider User B
    const directAccessRes = await request(app)
      .get(`/api/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(403);
    assert.strictEqual(directAccessRes.body.success, false);
    console.log("   ✔ Cross-workspace access blocked for outsider (403 Forbidden)");

    // -------------------------------------------------------------
    // 6. Project Creation & Retrieval
    // -------------------------------------------------------------
    console.log("\n6. Testing Project Management (POST /api/workspaces/:id/projects)...");
    const projRes = await request(app)
      .post(`/api/workspaces/${workspaceId}/projects`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        name: `Alpha SaaS Launch ${uniqueSuffix}`,
        description: "Live PostgreSQL test project",
        priority: "HIGH",
        status: "ACTIVE",
      })
      .expect(201);

    projectId = projRes.body.data.id;
    console.log(`   ✔ Project created in Neon: ID=${projectId}`);

    // User B attempting to view project tasks or details
    await request(app)
      .get(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(403);
    console.log("   ✔ Outsider blocked from accessing project tasks (403 Forbidden)");

    // -------------------------------------------------------------
    // 7. Task Creation, Update, and Comments
    // -------------------------------------------------------------
    console.log("\n7. Testing Task & Comment Lifecycle...");
    const taskRes = await request(app)
      .post(`/api/projects/${projectId}/tasks`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        title: "Setup Cloud PostgreSQL Pipeline",
        description: "Verify write and read integrity against Neon",
        priority: "HIGH",
        status: "TODO",
        type: "FEATURE",
      })
      .expect(201);

    taskId = taskRes.body.data.id;
    console.log(`   ✔ Task created: ID=${taskId}`);

    // Update Task Status
    const updateTaskRes = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        status: "IN_PROGRESS",
      })
      .expect(200);
    assert.strictEqual(updateTaskRes.body.data.status, "IN_PROGRESS");
    console.log("   ✔ Task status updated to IN_PROGRESS in Neon");

    // Add Comment
    const commentRes = await request(app)
      .post(`/api/tasks/${taskId}/comments`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        content: "Neon PostgreSQL persistence verified with ACID transactions.",
      })
      .expect(201);

    commentId = commentRes.body.data.id;
    assert.strictEqual(commentRes.body.data.user.id, userAId);
    console.log(`   ✔ Comment created by User A: ID=${commentId}`);

    // List Comments
    const listCommentsRes = await request(app)
      .get(`/api/tasks/${taskId}/comments`)
      .set("Authorization", `Bearer ${tokenA}`)
      .expect(200);
    assert.strictEqual(listCommentsRes.body.data.length, 1);
    console.log("   ✔ Comments retrieved with author metadata from Neon");

    // -------------------------------------------------------------
    // 8. Workspace Membership & Role Enforcement
    // -------------------------------------------------------------
    console.log("\n8. Testing Workspace Member Addition & Role Authorization...");
    // User A adds User B as MEMBER
    await request(app)
      .post(`/api/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({
        email: userBData.email,
        role: "MEMBER",
      })
      .expect(201);
    console.log("   ✔ User B added to Workspace as MEMBER");

    // User B can now view workspace details
    await request(app)
      .get(`/api/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(200);
    console.log("   ✔ User B now has legitimate workspace read access");

    // User B attempts to DELETE workspace (Only OWNER can delete)
    await request(app)
      .delete(`/api/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .expect(403);
    console.log("   ✔ Standard MEMBER blocked from deleting workspace (403 Forbidden)");

    // -------------------------------------------------------------
    // 9. Persistence Across Fresh Database Query
    // -------------------------------------------------------------
    console.log("\n9. Testing Direct Persistence Consistency in Neon...");
    const directTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        comments: true,
        project: {
          include: {
            workspace: true,
          },
        },
      },
    });
    assert(directTask, "Task must exist directly in Neon");
    assert.strictEqual(directTask.status, "IN_PROGRESS");
    assert.strictEqual(directTask.comments.length, 1);
    assert.strictEqual(directTask.project.workspace.id, workspaceId);
    console.log("   ✔ Verified relational persistence in Neon across 5 linked models");

    console.log("\n=================================================");
    console.log("   ALL LIVE API TESTS PASSED AGAINST NEON!       ");
    console.log("=================================================\n");
  } finally {
    // -------------------------------------------------------------
    // 10. Scoped Cleanup
    // -------------------------------------------------------------
    console.log("10. Performing Scoped Cleanup of Test Records...");
    for (const wsId of createdWorkspaceIds) {
      try {
        await prisma.workspace.delete({ where: { id: wsId } });
        console.log(`   ✔ Deleted test workspace: ${wsId} (cascaded projects/tasks/comments)`);
      } catch (err) {
        console.warn(`   ⚠️ Warning deleting workspace ${wsId}:`, err.message);
      }
    }

    for (const uId of createdUserIds) {
      try {
        await prisma.user.delete({ where: { id: uId } });
        console.log(`   ✔ Deleted test user: ${uId}`);
      } catch (err) {
        console.warn(`   ⚠️ Warning deleting user ${uId}:`, err.message);
      }
    }

    // Verify database row counts after cleanup
    const appTables = ["User", "Workspace", "WorkspaceMember", "Project", "ProjectMember", "Task", "Comment"];
    const finalCounts = [];
    for (const t of appTables) {
      const res = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "${t}";`);
      finalCounts.push({ table: t, rowCount: res[0].count });
    }
    console.log("\nFinal Neon Table Counts After Cleanup:", finalCounts);

    await prisma.$disconnect();
  }
}


runLiveVerification().catch(async (error) => {
  console.error("\n❌ Live Verification Failed:", error);
  try {
    await prisma.$disconnect();
  } catch {
    // Ignore disconnect error on exit
  }
  process.exit(1);
});

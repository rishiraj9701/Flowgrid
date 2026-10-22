import { z } from "zod";
import { prisma } from "../config/db.js";

// Validation schemas
export const createWorkspaceSchema = z.object({
  name: z.string().trim().min(2, "Workspace name must be at least 2 characters long"),
  description: z.string().trim().optional().nullable(),
  slug: z.string().trim().optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().trim().min(2, "Workspace name must be at least 2 characters long").optional(),
  description: z.string().trim().optional().nullable(),
});

export const addMemberSchema = z.object({
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});

/**
 * List all workspaces where authenticated user is a member
 * GET /api/workspaces
 */
export const listWorkspaces = async (req, res, next) => {
  try {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: req.user.id },
      include: {
        workspace: {
          include: {
            _count: {
              select: {
                projects: true,
                members: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    const workspaces = memberships.map((m) => ({
      ...m.workspace,
      currentUserRole: m.role,
    }));

    return res.status(200).json({
      success: true,
      data: workspaces,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Create a new workspace (creator automatically becomes OWNER)
 * POST /api/workspaces
 */
export const createWorkspace = async (req, res, next) => {
  try {
    const parseResult = createWorkspaceSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    const { name, description } = parseResult.data;
    const baseSlug = (parseResult.data.slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

    // Create workspace and assign owner in a transaction
    const newWorkspace = await prisma.$transaction(async (tx) => {
      const ws = await tx.workspace.create({
        data: {
          name,
          slug,
          description: description || null,
          ownerId: req.user.id,
        },
      });

      await tx.workspaceMember.create({
        data: {
          workspaceId: ws.id,
          userId: req.user.id,
          role: "OWNER",
        },
      });

      return ws;
    });

    return res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      data: newWorkspace,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get workspace details by ID (including projects and members)
 * GET /api/workspaces/:id
 */
export const getWorkspaceById = async (req, res, next) => {
  try {
    const workspace = await prisma.workspace.findUnique({
      where: { id: req.workspaceId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
        projects: {
          include: {
            lead: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            _count: {
              select: {
                tasks: true,
                members: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...workspace,
        currentUserRole: req.workspaceMember.role,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update workspace settings (name, description)
 * PATCH /api/workspaces/:id
 */
export const updateWorkspace = async (req, res, next) => {
  try {
    const parseResult = updateWorkspaceSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    const updated = await prisma.workspace.update({
      where: { id: req.workspaceId },
      data: parseResult.data,
    });

    return res.status(200).json({
      success: true,
      message: "Workspace updated successfully",
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete workspace (OWNER only)
 * DELETE /api/workspaces/:id
 */
export const deleteWorkspace = async (req, res, next) => {
  try {
    await prisma.workspace.delete({
      where: { id: req.workspaceId },
    });

    return res.status(200).json({
      success: true,
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * List workspace members
 * GET /api/workspaces/:id/members
 */
export const listWorkspaceMembers = async (req, res, next) => {
  try {
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: req.workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Add a member to workspace by email (OWNER / ADMIN)
 * POST /api/workspaces/:id/members
 */
export const addWorkspaceMember = async (req, res, next) => {
  try {
    const parseResult = addMemberSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    const { email, role } = parseResult.data;

    // Check if target user exists in database
    const targetUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Check if user is already a member
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: targetUser.id,
          workspaceId: req.workspaceId,
        },
      },
    });

    if (existingMember) {
      return res.status(409).json({
        success: false,
        message: "User is already a member of this workspace",
      });
    }

    const newMember = await prisma.workspaceMember.create({
      data: {
        workspaceId: req.workspaceId,
        userId: targetUser.id,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Member added to workspace successfully",
      data: newMember,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update a member's role (OWNER / ADMIN)
 * PATCH /api/workspaces/:id/members/:userId
 */
export const updateMemberRole = async (req, res, next) => {
  try {
    const parseResult = updateMemberRoleSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    const targetUserId = req.params.userId;
    const { role } = parseResult.data;

    const targetMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: targetUserId,
          workspaceId: req.workspaceId,
        },
      },
    });

    if (!targetMember) {
      return res.status(404).json({
        success: false,
        message: "Workspace member not found",
      });
    }

    // Do not allow changing the role of an OWNER
    if (targetMember.role === "OWNER") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Cannot alter the role of the workspace OWNER",
      });
    }

    // ADMINs cannot alter roles of other ADMINs; only OWNER can
    if (req.workspaceMember.role === "ADMIN" && targetMember.role === "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only workspace OWNER can alter an ADMIN's role",
      });
    }

    const updated = await prisma.workspaceMember.update({
      where: {
        userId_workspaceId: {
          userId: targetUserId,
          workspaceId: req.workspaceId,
        },
      },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Remove a member from workspace (OWNER / ADMIN)
 * DELETE /api/workspaces/:id/members/:userId
 */
export const removeWorkspaceMember = async (req, res, next) => {
  try {
    const targetUserId = req.params.userId;

    const targetMember = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: targetUserId,
          workspaceId: req.workspaceId,
        },
      },
    });

    if (!targetMember) {
      return res.status(404).json({
        success: false,
        message: "Workspace member not found",
      });
    }

    // Cannot remove the workspace OWNER
    if (targetMember.role === "OWNER") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Cannot remove the workspace OWNER",
      });
    }

    // An ADMIN cannot remove another ADMIN; only OWNER can (unless self-removing)
    if (
      req.workspaceMember.role === "ADMIN" &&
      targetMember.role === "ADMIN" &&
      targetUserId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only workspace OWNER can remove another ADMIN",
      });
    }

    await prisma.workspaceMember.delete({
      where: {
        userId_workspaceId: {
          userId: targetUserId,
          workspaceId: req.workspaceId,
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Member removed from workspace successfully",
    });
  } catch (error) {
    return next(error);
  }
};

import { z } from "zod";
import { prisma } from "../config/db.js";

// Validation schemas
export const createProjectSchema = z.object({
  name: z.string().trim().min(2, "Project name must be at least 2 characters long"),
  description: z.string().trim().optional().nullable(),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).default("ACTIVE"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  progress: z.number().int().min(0).max(100).default(0),
  start_date: z.string().datetime().optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).transform((v) => new Date(v).toISOString())),
  end_date: z.string().datetime().optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).transform((v) => new Date(v).toISOString())),
  team_lead: z.string().optional().nullable(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2, "Project name must be at least 2 characters long").optional(),
  description: z.string().trim().optional().nullable(),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  start_date: z.string().datetime().optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).transform((v) => new Date(v).toISOString())),
  end_date: z.string().datetime().optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).transform((v) => new Date(v).toISOString())),
  team_lead: z.string().optional().nullable(),
});

export const addProjectMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

/**
 * List projects within a workspace with search, status, and priority filters
 * GET /api/workspaces/:workspaceId/projects
 */
export const listProjects = async (req, res, next) => {
  try {
    const { search, status, priority } = req.query;

    const where = {
      workspaceId: req.workspaceId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const projects = await prisma.project.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
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
        },
        tasks: {
          select: {
            id: true,
            status: true,
            priority: true,
            type: true,
            due_date: true,
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
    });

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Create a new project in the workspace
 * POST /api/workspaces/:workspaceId/projects
 */
export const createProject = async (req, res, next) => {
  try {
    const parseResult = createProjectSchema.safeParse(req.body);
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

    const {
      name,
      description,
      status,
      priority,
      progress,
      start_date,
      end_date,
      team_lead,
    } = parseResult.data;

    // If team_lead provided, verify they are in this workspace
    if (team_lead) {
      const isLeadInWorkspace = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: team_lead,
            workspaceId: req.workspaceId,
          },
        },
      });

      if (!isLeadInWorkspace) {
        return res.status(400).json({
          success: false,
          message: "Assigned team lead must be a member of this workspace",
        });
      }
    }

    const project = await prisma.project.create({
      data: {
        workspaceId: req.workspaceId,
        name,
        description: description || null,
        status,
        priority,
        progress,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        team_lead: team_lead || req.user.id,
        members: {
          create: {
            userId: team_lead || req.user.id,
          },
        },
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
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
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get project details by ID with tasks, members, and metrics
 * GET /api/projects/:id
 */
export const getProjectById = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.project.id },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
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
        },
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            _count: {
              select: {
                comments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Compute task statistics for analytics
    const tasks = project.tasks || [];
    const stats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "TODO").length,
      in_progress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
      done: tasks.filter((t) => t.status === "DONE").length,
      completionRate:
        tasks.length > 0
          ? Math.round((tasks.filter((t) => t.status === "DONE").length / tasks.length) * 100)
          : 0,
    };

    return res.status(200).json({
      success: true,
      data: {
        ...project,
        stats,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update project settings
 * PATCH /api/projects/:id
 */
export const updateProject = async (req, res, next) => {
  try {
    const parseResult = updateProjectSchema.safeParse(req.body);
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

    // Role check: Only OWNER, ADMIN, or Project Lead can edit project settings
    const isOwnerOrAdmin = ["OWNER", "ADMIN"].includes(req.workspaceMember.role);
    const isProjectLead = req.project.team_lead === req.user.id;

    if (!isOwnerOrAdmin && !isProjectLead) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only workspace admins or the project lead may update this project",
      });
    }

    const { start_date, end_date, ...rest } = parseResult.data;

    const data = {
      ...rest,
      ...(start_date !== undefined && { start_date: start_date ? new Date(start_date) : null }),
      ...(end_date !== undefined && { end_date: end_date ? new Date(end_date) : null }),
    };

    const updated = await prisma.project.update({
      where: { id: req.project.id },
      data,
      include: {
        lead: {
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
      message: "Project updated successfully",
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete project
 * DELETE /api/projects/:id
 */
export const deleteProject = async (req, res, next) => {
  try {
    // Only OWNER, ADMIN, or Project Lead can delete project
    const isOwnerOrAdmin = ["OWNER", "ADMIN"].includes(req.workspaceMember.role);
    const isProjectLead = req.project.team_lead === req.user.id;

    if (!isOwnerOrAdmin && !isProjectLead) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Only workspace admins or the project lead may delete this project",
      });
    }

    await prisma.project.delete({
      where: { id: req.project.id },
    });

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Add a workspace member to a project
 * POST /api/projects/:id/members
 */
export const addProjectMember = async (req, res, next) => {
  try {
    const parseResult = addProjectMemberSchema.safeParse(req.body);
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

    const { userId } = parseResult.data;

    // Verify user belongs to project's workspace
    const isMemberOfWorkspace = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId: req.project.workspaceId,
        },
      },
    });

    if (!isMemberOfWorkspace) {
      return res.status(400).json({
        success: false,
        message: "Target user must be a member of the workspace before being added to a project",
      });
    }

    // Check if already in project
    const existingProjectMember = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: req.project.id,
        },
      },
    });

    if (existingProjectMember) {
      return res.status(409).json({
        success: false,
        message: "User is already a member of this project",
      });
    }

    const newMember = await prisma.projectMember.create({
      data: {
        projectId: req.project.id,
        userId,
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
      message: "Member added to project successfully",
      data: newMember,
    });
  } catch (error) {
    return next(error);
  }
};

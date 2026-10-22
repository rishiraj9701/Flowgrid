import { z } from "zod";
import { prisma } from "../config/db.js";

// Validation schemas
export const createTaskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required"),
  description: z.string().trim().optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  type: z.enum(["TASK", "BUG", "FEATURE", "IMPROVEMENT", "OTHER"]).default("TASK"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  assigneeId: z.string().optional().nullable(),
  due_date: z.string().datetime().optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).transform((v) => new Date(v).toISOString())).optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1, "Task title is required").optional(),
  description: z.string().trim().optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  type: z.enum(["TASK", "BUG", "FEATURE", "IMPROVEMENT", "OTHER"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  assigneeId: z.string().optional().nullable(),
  due_date: z.string().datetime().optional().nullable().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/).transform((v) => new Date(v).toISOString())).optional().nullable(),
});

export const batchDeleteSchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1, "At least one task ID is required"),
});

/**
 * List all tasks for a project
 * GET /api/projects/:projectId/tasks
 */
export const listProjectTasks = async (req, res, next) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { projectId: req.project.id },
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
    });

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Create a new task within a project
 * POST /api/projects/:projectId/tasks
 */
export const createTask = async (req, res, next) => {
  try {
    const parseResult = createTaskSchema.safeParse(req.body);
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

    const { title, description, status, type, priority, assigneeId, due_date } = parseResult.data;

    // If assigneeId provided, verify assignee belongs to the project's workspace
    if (assigneeId) {
      const isAssigneeInWorkspace = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: assigneeId,
            workspaceId: req.project.workspaceId,
          },
        },
      });

      if (!isAssigneeInWorkspace) {
        return res.status(400).json({
          success: false,
          message: "Task assignee must be a member of the workspace",
        });
      }
    }

    const task = await prisma.task.create({
      data: {
        projectId: req.project.id,
        title,
        description: description || null,
        status,
        type,
        priority,
        assigneeId: assigneeId || null,
        due_date: due_date ? new Date(due_date) : null,
      },
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
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get task details by ID
 * GET /api/tasks/:id
 */
export const getTaskById = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.task.id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            workspaceId: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        comments: {
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
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Update task
 * PATCH /api/tasks/:id
 */
export const updateTask = async (req, res, next) => {
  try {
    const parseResult = updateTaskSchema.safeParse(req.body);
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

    const { due_date, assigneeId, ...rest } = parseResult.data;

    // If assigneeId is being updated, verify they belong to the workspace
    if (assigneeId) {
      const isAssigneeInWorkspace = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: assigneeId,
            workspaceId: req.task.project.workspaceId,
          },
        },
      });

      if (!isAssigneeInWorkspace) {
        return res.status(400).json({
          success: false,
          message: "Task assignee must be a member of the workspace",
        });
      }
    }

    const updated = await prisma.task.update({
      where: { id: req.task.id },
      data: {
        ...rest,
        ...(assigneeId !== undefined && { assigneeId }),
        ...(due_date !== undefined && { due_date: due_date ? new Date(due_date) : null }),
      },
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
    });

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete single task
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res, next) => {
  try {
    await prisma.task.delete({
      where: { id: req.task.id },
    });

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Atomically delete multiple tasks
 * POST /api/tasks/batch-delete
 */
export const batchDeleteTasks = async (req, res, next) => {
  try {
    const parseResult = batchDeleteSchema.safeParse(req.body);
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

    const { taskIds } = parseResult.data;

    // Verify all tasks exist and user has workspace authorization for all of them
    const tasks = await prisma.task.findMany({
      where: { id: { in: taskIds } },
      include: {
        project: {
          select: {
            workspaceId: true,
          },
        },
      },
    });

    if (tasks.length !== taskIds.length) {
      return res.status(404).json({
        success: false,
        message: "One or more tasks were not found",
      });
    }

    // Check workspace memberships for all tasks
    const workspaceIds = [...new Set(tasks.map((t) => t.project.workspaceId))];
    const memberships = await prisma.workspaceMember.findMany({
      where: {
        userId: req.user.id,
        workspaceId: { in: workspaceIds },
      },
    });

    if (memberships.length !== workspaceIds.length) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to delete tasks from one or more workspaces",
      });
    }

    // Perform atomic batch delete inside transaction
    const deleteResult = await prisma.$transaction(async (tx) => {
      return tx.task.deleteMany({
        where: { id: { in: taskIds } },
      });
    });

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteResult.count} tasks`,
      count: deleteResult.count,
    });
  } catch (error) {
    return next(error);
  }
};

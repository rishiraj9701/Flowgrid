import { prisma } from "../config/db.js";

/**
 * Authorization middleware to verify that the authenticated user is a member
 * of the requested workspace.
 * Attaches req.workspaceMember and req.workspaceId.
 */
export const requireWorkspaceMember = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User identity not established",
      });
    }

    const workspaceId =
      req.params.workspaceId ||
      req.params.id ||
      req.body?.workspaceId ||
      req.query?.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Bad Request: Workspace ID is required",
      });
    }

    // Check membership in database
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.id,
          workspaceId: workspaceId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not a member of this workspace",
      });
    }

    req.workspaceMember = member;
    req.workspaceId = workspaceId;
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Role-based authorization middleware factory.
 * Enforces that req.workspaceMember has one of the allowed roles.
 * @param {Array<string>} allowedRoles e.g. ["OWNER"], ["OWNER", "ADMIN"]
 */
export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.workspaceMember) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Workspace membership context missing",
      });
    }

    const userRole = req.workspaceMember.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Insufficient permissions. Requires one of: [${allowedRoles.join(", ")}]`,
      });
    }

    return next();
  };
};

/**
 * Middleware to verify access to a Project via its workspace relationship.
 * Attaches req.project, req.workspaceId, and req.workspaceMember.
 */
export const requireProjectAccess = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User identity not established",
      });
    }

    const projectId = req.params.projectId || req.params.id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Bad Request: Project ID is required",
      });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Verify user belongs to project's workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.id,
          workspaceId: project.workspaceId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not a member of the workspace owning this project",
      });
    }

    req.project = project;
    req.workspaceId = project.workspaceId;
    req.workspaceMember = member;
    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Middleware to verify access to a Task via its project and workspace relationships.
 * Attaches req.task, req.project, req.workspaceId, and req.workspaceMember.
 */
export const requireTaskAccess = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User identity not established",
      });
    }

    const taskId = req.params.taskId || req.params.id;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: "Bad Request: Task ID is required",
      });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Verify user belongs to task's workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: req.user.id,
          workspaceId: task.project.workspaceId,
        },
      },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not a member of the workspace owning this task",
      });
    }

    req.task = task;
    req.project = task.project;
    req.workspaceId = task.project.workspaceId;
    req.workspaceMember = member;
    return next();
  } catch (error) {
    return next(error);
  }
};

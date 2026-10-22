import express from "express";
import {
  listProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
} from "../controllers/projectController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireProjectAccess, requireWorkspaceMember } from "../middleware/authorize.js";

// Router for /api/projects/:id
export const projectRouter = express.Router();
projectRouter.use(requireAuth);
projectRouter.get("/:id", requireProjectAccess, getProjectById);
projectRouter.patch("/:id", requireProjectAccess, updateProject);
projectRouter.delete("/:id", requireProjectAccess, deleteProject);
projectRouter.post("/:id/members", requireProjectAccess, addProjectMember);

// Router for /api/workspaces/:workspaceId/projects
export const workspaceProjectsRouter = express.Router({ mergeParams: true });
workspaceProjectsRouter.use(requireAuth);
workspaceProjectsRouter.get("/", requireWorkspaceMember, listProjects);
workspaceProjectsRouter.post("/", requireWorkspaceMember, createProject);

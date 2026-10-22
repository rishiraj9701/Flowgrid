import express from "express";
import {
  listWorkspaces,
  createWorkspace,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  listWorkspaceMembers,
  addWorkspaceMember,
  updateMemberRole,
  removeWorkspaceMember,
} from "../controllers/workspaceController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireWorkspaceMember, requireRole } from "../middleware/authorize.js";

const router = express.Router();

// Apply requireAuth across all workspace routes
router.use(requireAuth);

// Workspace CRUD
router.get("/", listWorkspaces);
router.post("/", createWorkspace);
router.get("/:id", requireWorkspaceMember, getWorkspaceById);
router.patch("/:id", requireWorkspaceMember, requireRole(["OWNER", "ADMIN"]), updateWorkspace);
router.delete("/:id", requireWorkspaceMember, requireRole(["OWNER"]), deleteWorkspace);

// Workspace Member Management
router.get("/:id/members", requireWorkspaceMember, listWorkspaceMembers);
router.post("/:id/members", requireWorkspaceMember, requireRole(["OWNER", "ADMIN"]), addWorkspaceMember);
router.patch("/:id/members/:userId", requireWorkspaceMember, requireRole(["OWNER", "ADMIN"]), updateMemberRole);
router.delete("/:id/members/:userId", requireWorkspaceMember, requireRole(["OWNER", "ADMIN"]), removeWorkspaceMember);

export default router;

import express from "express";
import {
  listProjectTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  batchDeleteTasks,
} from "../controllers/taskController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireProjectAccess, requireTaskAccess } from "../middleware/authorize.js";

// Task router for /api/tasks
export const taskRouter = express.Router();
taskRouter.use(requireAuth);
taskRouter.post("/batch-delete", batchDeleteTasks);
taskRouter.get("/:id", requireTaskAccess, getTaskById);
taskRouter.patch("/:id", requireTaskAccess, updateTask);
taskRouter.delete("/:id", requireTaskAccess, deleteTask);

// Project tasks router for /api/projects/:projectId/tasks
export const projectTasksRouter = express.Router({ mergeParams: true });
projectTasksRouter.use(requireAuth);
projectTasksRouter.get("/", requireProjectAccess, listProjectTasks);
projectTasksRouter.post("/", requireProjectAccess, createTask);

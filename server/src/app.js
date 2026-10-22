import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import { projectRouter, workspaceProjectsRouter } from "./routes/projectRoutes.js";
import { taskRouter, projectTasksRouter } from "./routes/taskRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

const app = express();

// Configure CORS with explicitly allowed origins
const allowedOrigins = [
  config.FRONTEND_URL,
  ...(config.NODE_ENV !== "production" ? ["http://localhost:5173", "http://127.0.0.1:5173"] : []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or matching allowed list
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS policy`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Standard JSON body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    service: "project-management-api",
  });
});

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/workspaces/:workspaceId/projects", workspaceProjectsRouter);
app.use("/api/projects", projectRouter);
app.use("/api/projects/:projectId/tasks", projectTasksRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/tasks/:taskId/comments", commentRoutes);

// Catch 404 routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;

import app from "./app.js";
import { config } from "./config/env.js";

const server = app.listen(config.PORT, () => {
  console.log(`🚀 Project Management API server running on port ${config.PORT}`);
  console.log(`📡 Environment: ${config.NODE_ENV}`);
  console.log(`🌐 CORS Allowed Origin: ${config.FRONTEND_URL}`);
  console.log(`🩺 Health check available at: http://localhost:${config.PORT}/api/health`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log("👋 HTTP server closed.");
    process.exit(0);
  });

  // Force shutdown if taking longer than 10s
  setTimeout(() => {
    console.error("⚠️ Forcefully terminating after timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

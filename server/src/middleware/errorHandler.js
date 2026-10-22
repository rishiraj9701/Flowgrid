import { config } from "../config/env.js";

// Not Found handler
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// Centralized Error handler
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  const response = {
    success: false,
    message: err.message || "Internal Server Error",
    ...(err.errors && { errors: err.errors }),
    ...(config.NODE_ENV !== "production" && { stack: err.stack }),
  };

  if (statusCode === 500 && config.NODE_ENV === "production") {
    response.message = "An unexpected error occurred. Please try again later.";
  }

  res.status(statusCode).json(response);
};

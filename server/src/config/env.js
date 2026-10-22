import dotenv from "dotenv";
import { z } from "zod";

// Load environment variables from .env if present
dotenv.config();

const envSchema = z
  .object({
    PORT: z.string().default("5000").transform((val) => parseInt(val, 10)),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    FRONTEND_URL: z.string().default("http://localhost:5173"),
    DATABASE_URL: z.string().optional().default(""),
    JWT_SECRET: z.string().default("dev-fallback-secret-key-at-least-32-chars-long"),
  })
  .refine(
    (data) => {
      if (data.NODE_ENV === "production") {
        return (
          Boolean(data.DATABASE_URL) &&
          !data.DATABASE_URL.includes("USER:PASSWORD")
        );
      }
      return true;
    },
    {
      message: "In production, DATABASE_URL must be configured with a real PostgreSQL connection string.",
      path: ["DATABASE_URL"],
    }
  )
  .refine(
    (data) => {
      if (data.NODE_ENV === "production") {
        return (
          data.JWT_SECRET &&
          data.JWT_SECRET.length >= 32 &&
          data.JWT_SECRET !== "dev-fallback-secret-key-at-least-32-chars-long"
        );
      }
      return true;
    },
    {
      message: "In production, JWT_SECRET must be set and contain at least 32 characters.",
      path: ["JWT_SECRET"],
    }
  );

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment configuration:", parsedEnv.error.format());
  throw new Error("Invalid environment configuration. Check your .env file.");
}

export const config = parsedEnv.data;

import { PrismaClient } from "@prisma/client";
import { config } from "./env.js";

let prismaInstance = null;

export const getPrismaClient = () => {
  if (!prismaInstance) {
    if (!config.DATABASE_URL) {
      console.warn("⚠️ DATABASE_URL is not configured. Database operations will fail until set.");
    }
    prismaInstance = new PrismaClient({
      log: config.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }
  return prismaInstance;
};

export const prisma = getPrismaClient();

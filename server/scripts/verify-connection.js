import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const sanitize = (str) => {
  if (!str) return "";
  return str.replace(/:\/\/[^:]+:[^@]+@/, "://***:***@");
};

async function verify() {
  console.log("=== Environment Verification ===");
  const requiredVars = ["PORT", "FRONTEND_URL", "DATABASE_URL", "JWT_SECRET", "NODE_ENV"];
  const varStatus = {};
  
  for (const v of requiredVars) {
    const val = process.env[v];
    varStatus[v] = {
      present: Boolean(val),
      isPlaceholder: val ? val.includes("USER:PASSWORD") || val.includes("your-super-secret-jwt-key") : false,
    };
  }

  for (const [k, s] of Object.entries(varStatus)) {
    console.log(`- ${k}: ${s.present ? "Present (configured)" : "MISSING"}${s.isPlaceholder ? " [Note: using placeholder/default]" : ""}`);
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL is missing in server/.env");
    process.exit(1);
  }

  try {
    const parsed = new URL(dbUrl);
    console.log(`- Database Protocol: ${parsed.protocol}`);
    console.log(`- Database Host: ${parsed.hostname}`);
    console.log(`- Database Name: ${parsed.pathname.replace(/^\//, "")}`);
    console.log(`- SSL Mode: ${parsed.searchParams.get("sslmode") || "default"}`);
  } catch {
    console.log("- Database URL: Valid URI parsing failed, will let Prisma attempt connection.");
  }

  console.log("\n=== Testing Live Read-Only Connection (SELECT 1) ===");
  const prisma = new PrismaClient({
    log: ["error"],
  });

  try {
    const startTime = Date.now();
    const result = await prisma.$queryRawUnsafe("SELECT 1 as result");
    const durationMs = Date.now() - startTime;

    console.log("✅ Live connection to PostgreSQL succeeded!");
    console.log(`- Query: SELECT 1 as result`);
    console.log(`- Execution time: ${durationMs}ms`);
    console.log(`- Query Result:`, JSON.stringify(result, (key, value) =>
      typeof value === "bigint" ? Number(value) : value
    ));
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ PostgreSQL Connection Failed:");
    console.error(`- Error Code: ${error.code || "UNKNOWN"}`);
    console.error(`- Sanitized Message: ${sanitize(error.message)}`);
    await prisma.$disconnect();
    process.exit(1);
  }
}

verify();

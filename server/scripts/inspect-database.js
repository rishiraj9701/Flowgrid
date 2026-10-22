import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

async function inspectDatabase() {
  console.log("=== Inspecting Neon PostgreSQL Database ===");
  const prisma = new PrismaClient({ log: ["error"] });

  try {
    // 1. Check existing schemas
    const schemas = await prisma.$queryRawUnsafe(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name;
    `);
    console.log("User/Application Schemas:", schemas);

    // 2. Check all tables in public schema
    const tables = await prisma.$queryRawUnsafe(`
      SELECT table_schema, table_name, table_type 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log(`Public Tables count: ${tables.length}`);
    console.log("Public Tables:", tables);

    // 3. Check if _prisma_migrations table exists
    const migrationTable = await prisma.$queryRawUnsafe(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = '_prisma_migrations';
    `);

    if (migrationTable.length > 0) {
      console.log("Prisma migration history table found.");
      const migrations = await prisma.$queryRawUnsafe(`
        SELECT id, migration_name, finished_at, rolled_back_at 
        FROM "_prisma_migrations" 
        ORDER BY started_at ASC;
      `);
      console.log("Applied Migrations:", migrations);

      // Verify row counts in all application tables
      const appTables = ['User', 'Workspace', 'WorkspaceMember', 'Project', 'ProjectMember', 'Task', 'Comment'];
      const counts = [];
      for (const t of appTables) {
        const res = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM "${t}";`);
        counts.push({ table: t, rowCount: res[0].count });
      }
      console.log("Application Tables Row Counts (confirming 0 records / unseeded):", counts);
    } else {
      console.log("No '_prisma_migrations' table found. Database has not been migrated with Prisma yet.");
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error("Error inspecting database:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

inspectDatabase();

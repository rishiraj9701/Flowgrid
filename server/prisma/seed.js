import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ Cannot seed database: DATABASE_URL is not set in environment.");
    process.exit(1);
  }

  console.log("🌱 Starting idempotent database seeding...");

  // 1. Demo password hash (Password123!) for development seed
  const defaultPasswordHash = await bcrypt.hash("Password123!", 10);

  // 2. Upsert Demo Users (Nexus Workspace Team)
  const usersData = [
    {
      id: "user_1",
      name: "Marcus Vance",
      email: "marcus.vance@nexus.io",
      image: "profile_img_a.svg",
    },
    {
      id: "user_2",
      name: "Elena Rostova",
      email: "elena.rostova@nexus.io",
      image: "profile_img_j.svg",
    },
    {
      id: "user_3",
      name: "David Kim",
      email: "david.kim@nexus.io",
      image: "profile_img_o.svg",
    },
    {
      id: "user_4",
      name: "Sophia Chen",
      email: "sophia.chen@nexus.io",
      image: "profile_img_a.svg",
    },
    {
      id: "user_5",
      name: "Liam Patel",
      email: "liam.patel@nexus.io",
      image: "profile_img_j.svg",
    },
    {
      id: "user_6",
      name: "Aria Montgomery",
      email: "aria.montgomery@nexus.io",
      image: "profile_img_o.svg",
    },
  ];

  for (const user of usersData) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        image: user.image,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: defaultPasswordHash,
        image: user.image,
      },
    });
  }
  console.log("✅ Seeded demo users (Password: Password123!)");

  // 3. Upsert Demo Workspace (Nexus Workspace)
  const workspace = await prisma.workspace.upsert({
    where: { slug: "nexus-workspace" },
    update: {
      name: "Nexus Workspace",
      description: "A collaborative workspace for building modern SaaS products, AI-powered analytics, and scalable web applications.",
      ownerId: "user_3",
    },
    create: {
      id: "workspace_nexus_01",
      name: "Nexus Workspace",
      slug: "nexus-workspace",
      description: "A collaborative workspace for building modern SaaS products, AI-powered analytics, and scalable web applications.",
      ownerId: "user_3",
    },
  });
  console.log(`✅ Seeded workspace: ${workspace.name}`);

  // 4. Upsert Workspace Members
  const workspaceMembers = [
    { id: "wm_nexus_01", userId: "user_3", workspaceId: workspace.id, role: "OWNER" },
    { id: "wm_nexus_02", userId: "user_1", workspaceId: workspace.id, role: "ADMIN" },
    { id: "wm_nexus_03", userId: "user_2", workspaceId: workspace.id, role: "MEMBER" },
    { id: "wm_nexus_04", userId: "user_4", workspaceId: workspace.id, role: "MEMBER" },
    { id: "wm_nexus_05", userId: "user_5", workspaceId: workspace.id, role: "MEMBER" },
    { id: "wm_nexus_06", userId: "user_6", workspaceId: workspace.id, role: "MEMBER" },
  ];

  for (const wm of workspaceMembers) {
    await prisma.workspaceMember.upsert({
      where: {
        userId_workspaceId: {
          userId: wm.userId,
          workspaceId: wm.workspaceId,
        },
      },
      update: { role: wm.role },
      create: {
        id: wm.id,
        userId: wm.userId,
        workspaceId: wm.workspaceId,
        role: wm.role,
      },
    });
  }
  console.log("✅ Seeded workspace memberships");

  // 5. Upsert Demo Projects
  const projectsData = [
    {
      id: "proj_analytics_01",
      workspaceId: workspace.id,
      name: "Nexus Analytics Dashboard",
      description: "Build a modern analytics dashboard with interactive charts, filtering, KPI cards, and responsive layouts.",
      priority: "HIGH",
      status: "ACTIVE",
      progress: 70,
      start_date: new Date("2026-09-01"),
      end_date: new Date("2026-11-20"),
      team_lead: "user_2",
    },
    {
      id: "proj_saas_02",
      workspaceId: workspace.id,
      name: "SaaS Platform Development",
      description: "Develop the core SaaS application, including authentication, workspace management, API integration, and billing-ready architecture.",
      priority: "HIGH",
      status: "ACTIVE",
      progress: 60,
      start_date: new Date("2026-08-15"),
      end_date: new Date("2026-12-20"),
      team_lead: "user_1",
    },
    {
      id: "proj_portfolio_03",
      workspaceId: workspace.id,
      name: "Portfolio Website Redesign",
      description: "Create a polished, accessible, responsive developer portfolio with strong performance and refined interactions.",
      priority: "MEDIUM",
      status: "COMPLETED",
      progress: 100,
      start_date: new Date("2026-07-01"),
      end_date: new Date("2026-09-30"),
      team_lead: "user_6",
    },
    {
      id: "proj_ai_prep_04",
      workspaceId: workspace.id,
      name: "AI Interview Preparation",
      description: "Build an AI-assisted interview practice experience with session management, question generation, and progress tracking.",
      priority: "HIGH",
      status: "PLANNING",
      progress: 35,
      start_date: new Date("2026-10-01"),
      end_date: new Date("2027-01-30"),
      team_lead: "user_4",
    },
  ];

  for (const proj of projectsData) {
    await prisma.project.upsert({
      where: { id: proj.id },
      update: {
        name: proj.name,
        description: proj.description,
        priority: proj.priority,
        status: proj.status,
        progress: proj.progress,
      },
      create: proj,
    });
  }
  console.log(`✅ Seeded ${projectsData.length} projects`);

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

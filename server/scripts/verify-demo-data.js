import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsPath = path.resolve(__dirname, "../../src/assets/assets.js");
let fileContent = fs.readFileSync(assetsPath, "utf-8");

// Mock image variables at top
const mockHeader = `
const workspace_img_default = "/assets/workspace_img_default.png";
const profile_img_a = "/assets/profile_img_a.svg";
const profile_img_o = "/assets/profile_img_o.svg";
const profile_img_j = "/assets/profile_img_j.svg";
`;

fileContent = fileContent.replace(/import\s+\w+\s+from\s+["'][^"']+\.(png|svg)["'];?/g, "");
fileContent = mockHeader + fileContent;

const dataUri = `data:text/javascript;base64,${Buffer.from(fileContent).toString("base64")}`;
const { dummyUsers, dummyWorkspaces } = await import(dataUri);

console.log("=== Verifying Nexus Workspace Demo Dataset Integrity ===");

// 1. Verify Users
assert.strictEqual(dummyUsers.length, 6, "Must have exactly 6 fictional demo users");
const userIds = new Set(dummyUsers.map((u) => u.id));
assert.strictEqual(userIds.size, 6, "All user IDs must be unique");

console.log(`✔ Verified ${dummyUsers.length} fictional team members:`);
dummyUsers.forEach((u) => console.log(`   - ${u.name} (${u.email}) [ID: ${u.id}]`));

// 2. Verify Workspaces
assert.strictEqual(dummyWorkspaces.length, 1, "Must have 1 primary workspace");
const ws = dummyWorkspaces[0];
assert.strictEqual(ws.name, "Nexus Workspace");
assert.strictEqual(ws.slug, "nexus-workspace");
assert.strictEqual(ws.ownerId, "user_3");
assert(ws.members.length === 6, "Workspace must have all 6 members");

console.log(`\n✔ Verified Primary Workspace: ${ws.name} (${ws.description})`);

// 3. Verify Projects
assert.strictEqual(ws.projects.length, 4, "Must have exactly 4 projects");
const expectedProjects = [
  "Nexus Analytics Dashboard",
  "SaaS Platform Development",
  "Portfolio Website Redesign",
  "AI Interview Preparation",
];
const projectNames = ws.projects.map((p) => p.name);
assert.deepStrictEqual(projectNames, expectedProjects, "Project names must match requested concepts");

let totalTasks = 0;
let completedTasks = 0;
let inProgressTasks = 0;
let todoTasks = 0;
let myTasksMarcus = 0;
let overdueTasks = 0;
const now = new Date("2026-10-22T11:41:37.000Z");

const allTaskIds = new Set();
const allCommentIds = new Set();

ws.projects.forEach((proj) => {
  assert.strictEqual(proj.workspaceId, ws.id, `Project ${proj.name} must belong to ${ws.id}`);
  assert(proj.tasks && proj.tasks.length >= 5, `Project ${proj.name} must have at least 5 tasks`);
  assert(proj.members && proj.members.length > 0, `Project ${proj.name} must have members`);

  proj.members.forEach((pm) => {
    assert(userIds.has(pm.userId), `Project member ${pm.userId} must be a valid user`);
  });

  proj.tasks.forEach((t) => {
    assert(!allTaskIds.has(t.id), `Duplicate task ID: ${t.id}`);
    allTaskIds.add(t.id);
    assert.strictEqual(t.projectId, proj.id, `Task ${t.title} must match project ID`);
    assert(userIds.has(t.assigneeId), `Task assignee ${t.assigneeId} must be valid user`);
    assert(["TODO", "IN_PROGRESS", "DONE"].includes(t.status), `Invalid task status: ${t.status}`);
    assert(["LOW", "MEDIUM", "HIGH"].includes(t.priority), `Invalid task priority: ${t.priority}`);
    assert(["TASK", "BUG", "FEATURE", "IMPROVEMENT", "OTHER"].includes(t.type), `Invalid task type: ${t.type}`);

    totalTasks++;
    if (t.status === "DONE") completedTasks++;
    if (t.status === "IN_PROGRESS") inProgressTasks++;
    if (t.status === "TODO") todoTasks++;
    if (t.assigneeId === "user_1") myTasksMarcus++;

    if (t.due_date && new Date(t.due_date) < now && t.status !== "DONE") {
      overdueTasks++;
    }

    (t.comments || []).forEach((c) => {
      assert(!allCommentIds.has(c.id), `Duplicate comment ID: ${c.id}`);
      allCommentIds.add(c.id);
      assert(c.content && c.content.length > 0, "Comment content cannot be empty");
      assert(c.author, "Comment author must be present");
    });
  });

  console.log(`   ✔ Project: '${proj.name}' | Status: ${proj.status} | Progress: ${proj.progress}% | Tasks: ${proj.tasks.length}`);
});

console.log("\n=== Dataset Aggregate Statistics ===");
console.log(`- Total Tasks: ${totalTasks} (Expected: 24)`);
console.log(`- Status Distribution: ${completedTasks} DONE, ${inProgressTasks} IN_PROGRESS, ${todoTasks} TODO`);
console.log(`- My Tasks (Marcus Vance): ${myTasksMarcus}`);
console.log(`- Overdue Tasks: ${overdueTasks}`);
console.log(`- Discussion Comments: ${allCommentIds.size}`);

assert.strictEqual(totalTasks, 24, "Total tasks must equal 24");
assert.strictEqual(completedTasks, 10, "Completed tasks must equal 10");
assert.strictEqual(inProgressTasks, 7, "In progress tasks must equal 7");
assert.strictEqual(todoTasks, 7, "Todo tasks must equal 7");
assert.strictEqual(myTasksMarcus, 6, "My tasks must equal 6");
assert.strictEqual(overdueTasks, 1, "Exactly 1 overdue task expected");

console.log("\n✅ ALL DEMO DATA INTEGRITY CHECKS PASSED!");

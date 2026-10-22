import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";

describe("Backend Foundation Tests", () => {
  it("can import app independently of server startup", () => {
    assert.ok(app, "Express application should be defined");
    assert.strictEqual(typeof app.listen, "function", "App should be an Express instance");
  });

  it("GET /api/health returns 200 and healthy status", async () => {
    const res = await request(app).get("/api/health");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.status, "healthy");
    assert.strictEqual(res.body.service, "project-management-api");
    assert.ok(res.body.timestamp, "Response should include ISO timestamp");
  });

  it("returns 404 with standardized JSON response for unknown routes", async () => {
    const res = await request(app).get("/api/unknown-route");
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.body.success, false);
    assert.match(res.body.message, /Route not found/);
  });

  it("allows CORS from configured origins", async () => {
    const res = await request(app)
      .get("/api/health")
      .set("Origin", "http://localhost:5173");

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers["access-control-allow-origin"], "http://localhost:5173");
    assert.strictEqual(res.headers["access-control-allow-credentials"], "true");
  });
});

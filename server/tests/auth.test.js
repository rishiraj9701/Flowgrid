import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/db.js";
import {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
  toSafeUser,
} from "../src/utils/auth.js";
import { requireRole } from "../src/middleware/authorize.js";

describe("Phase 6D: Authentication & Authorization Test Suite", () => {
  beforeEach(() => {
    // Reset prisma mock stubs before each test
    prisma.user = {
      findUnique: async () => null,
      create: async ({ data }) => ({
        id: "mock-user-123",
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        image: data.image || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    };

    prisma.workspaceMember = {
      findUnique: async () => null,
    };
  });

  // ==========================================
  // 1. Password Hashing & Verification Tests
  // ==========================================
  describe("Password Hashing & Verification", () => {
    it("hashes a password securely and verifies match", async () => {
      const plaintext = "SuperSecret123!";
      const hash = await hashPassword(plaintext);

      assert.notStrictEqual(hash, plaintext, "Hash must not equal plaintext");
      assert.ok(hash.startsWith("$2"), "Hash must be a valid bcrypt hash format");

      const isMatch = await comparePassword(plaintext, hash);
      assert.strictEqual(isMatch, true, "Valid password must compare true");

      const isMismatch = await comparePassword("WrongPassword!", hash);
      assert.strictEqual(isMismatch, false, "Invalid password must compare false");
    });

    it("throws error if hashing empty or non-string password", async () => {
      await assert.rejects(async () => {
        await hashPassword("");
      }, /Password must be a non-empty string/);
    });
  });

  // ==========================================
  // 2. JWT Signing & Verification Tests
  // ==========================================
  describe("JWT Signing, Verification & Expiry", () => {
    it("signs and verifies a valid JWT payload", () => {
      const payload = { id: "user-456", email: "test@example.com", name: "Tester" };
      const token = signToken(payload);

      assert.strictEqual(typeof token, "string");
      assert.strictEqual(token.split(".").length, 3, "JWT must have 3 segments");

      const decoded = verifyToken(token);
      assert.strictEqual(decoded.id, payload.id);
      assert.strictEqual(decoded.email, payload.email);
      assert.strictEqual(decoded.name, payload.name);
    });

    it("rejects malformed, empty, or tampered JWTs", () => {
      assert.strictEqual(verifyToken("invalid.token"), null);
      assert.strictEqual(verifyToken(""), null);
      assert.strictEqual(verifyToken(null), null);

      const validToken = signToken({ id: "user-123" });
      const tamperedToken = validToken.slice(0, -6) + "xxxxxx";
      assert.strictEqual(verifyToken(tamperedToken), null);
    });
  });

  // ==========================================
  // 3. User Sanitization
  // ==========================================
  describe("User Sanitization", () => {
    it("removes passwordHash from user object", () => {
      const dbUser = {
        id: "user-1",
        name: "Alice",
        email: "alice@example.com",
        passwordHash: "$2a$10$xyz...",
        createdAt: new Date(),
      };

      const safe = toSafeUser(dbUser);
      assert.strictEqual(safe.passwordHash, undefined, "passwordHash must be stripped");
      assert.strictEqual(safe.id, "user-1");
      assert.strictEqual(safe.email, "alice@example.com");
    });
  });

  // ==========================================
  // 4. Registration Endpoint Tests
  // ==========================================
  describe("POST /api/auth/register", () => {
    it("successfully registers a new user and returns safe profile with token", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "NewUser@Example.com",
          password: "Password123!",
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.user.email, "newuser@example.com", "Email must be normalized");
      assert.strictEqual(res.body.data.user.passwordHash, undefined, "Never return passwordHash");
      assert.ok(res.body.data.token, "Must return signed token");
    });

    it("rejects duplicate email with 409 Conflict", async () => {
      prisma.user.findUnique = async () => ({
        id: "existing-user",
        email: "taken@example.com",
      });

      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Duplicate User",
          email: "taken@example.com",
          password: "Password123!",
        });

      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Email is already registered");
    });

    it("rejects registration with invalid email or short password (< 8 chars)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "U",
          email: "not-an-email",
          password: "short",
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Validation failed");
      assert.ok(Array.isArray(res.body.errors));
    });
  });

  // ==========================================
  // 5. Login Endpoint Tests
  // ==========================================
  describe("POST /api/auth/login", () => {
    it("successfully logs in with valid credentials", async () => {
      const password = "CorrectPassword123!";
      const passwordHash = await hashPassword(password);

      prisma.user.findUnique = async () => ({
        id: "user-logged-in",
        name: "Valid User",
        email: "valid@example.com",
        passwordHash,
      });

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "valid@example.com",
          password,
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.user.email, "valid@example.com");
      assert.strictEqual(res.body.data.user.passwordHash, undefined);
      assert.ok(res.body.data.token);
    });

    it("rejects invalid login credentials with generic 401 Unauthorized", async () => {
      prisma.user.findUnique = async () => null;

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent@example.com",
          password: "Password123!",
        });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Invalid email or password");
    });
  });

  // ==========================================
  // 6. Protected /api/auth/me Tests
  // ==========================================
  describe("GET /api/auth/me", () => {
    it("returns authenticated user profile when valid Bearer token provided", async () => {
      const token = signToken({
        id: "user-me-123",
        email: "me@example.com",
        name: "Me User",
      });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.user.id, "user-me-123");
    });

    it("rejects request without Authorization header with 401", async () => {
      const res = await request(app).get("/api/auth/me");

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Missing or invalid authorization token/);
    });

    it("rejects request with malformed or invalid token with 401", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid.token.value");

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Invalid or expired token/);
    });
  });

  // ==========================================
  // 7. Logout Endpoint Tests
  // ==========================================
  describe("POST /api/auth/logout", () => {
    it("returns 200 and advises client to discard stored JWT", async () => {
      const res = await request(app).post("/api/auth/logout");

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.success, true);
      assert.match(res.body.message, /Client must discard the stored JWT/);
    });
  });

  // ==========================================
  // 8. Role-Based Authorization Guard Tests
  // ==========================================
  describe("Role-based Authorization Guard (requireRole)", () => {
    it("permits access when member role is included in allowedRoles", () => {
      const req = { workspaceMember: { role: "ADMIN" } };
      let called = false;
      const next = () => { called = true; };
      const res = {};

      const guard = requireRole(["OWNER", "ADMIN"]);
      guard(req, res, next);

      assert.strictEqual(called, true, "Middleware should call next()");
    });

    it("blocks access with 403 Forbidden when member role is insufficient", () => {
      const req = { workspaceMember: { role: "MEMBER" } };
      let statusSent = null;
      let jsonSent = null;

      const res = {
        status: (code) => {
          statusSent = code;
          return {
            json: (data) => { jsonSent = data; },
          };
        },
      };
      const next = () => {};

      const guard = requireRole(["OWNER"]);
      guard(req, res, next);

      assert.strictEqual(statusSent, 403);
      assert.strictEqual(jsonSent.success, false);
      assert.match(jsonSent.message, /Insufficient permissions/);
    });
  });
});

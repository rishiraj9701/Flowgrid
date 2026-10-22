import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d";

/**
 * Hashes a plaintext password using bcrypt.
 * @param {string} password
 * @returns {Promise<string>}
 */
export const hashPassword = async (password) => {
  if (!password || typeof password !== "string") {
    throw new Error("Password must be a non-empty string");
  }
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compares a plaintext password against a bcrypt hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (password, hash) => {
  if (!password || !hash) return false;
  return bcrypt.compare(password, hash);
};

/**
 * Signs a JWT with user payload and expiration.
 * @param {object} payload - { id, email, name }
 * @returns {string} Signed JWT string
 */
export const signToken = (payload) => {
  if (!payload || !payload.id) {
    throw new Error("Token payload must include user ID");
  }

  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      name: payload.name,
    },
    config.JWT_SECRET,
    {
      expiresIn: TOKEN_EXPIRY,
      algorithm: "HS256",
    }
  );
};

/**
 * Verifies a JWT token. Returns decoded payload or null if invalid/expired.
 * @param {string} token
 * @returns {object|null}
 */
export const verifyToken = (token) => {
  try {
    if (!token || typeof token !== "string") return null;
    return jwt.verify(token, config.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    // Return null for any verification failure (expired, malformed, invalid signature)
    return null;
  }
};

/**
 * Sanitizes a user database record into a safe public profile without passwordHash.
 * @param {object} user
 * @returns {object}
 */
export const toSafeUser = (user) => {
  if (!user) return null;
  const safeUser = { ...user };
  delete safeUser.passwordHash;
  return safeUser;
};

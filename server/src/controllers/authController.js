import { z } from "zod";
import { prisma } from "../config/db.js";
import { hashPassword, comparePassword, signToken, toSafeUser } from "../utils/auth.js";

// Validation schemas
export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long"),
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

/**
 * Register a new user
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    const { name, email, password } = parseResult.data;

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Hash password & save user
    const passwordHash = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        image: "",
      },
    });

    const token = signToken(newUser);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: toSafeUser(newUser),
        token,
      },
    });
  } catch (error) {
    // Handle database uniqueness race conditions
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }
    return next(error);
  }
};

/**
 * Authenticate existing user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parseResult.error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    const { email, password } = parseResult.data;

    // Retrieve user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Constant-time check or generic message to prevent email enumeration
    const isPasswordValid = user ? await comparePassword(password, user.passwordHash) : false;

    if (!user || !isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = signToken(user);

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      data: {
        user: toSafeUser(user),
        token,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Get current authenticated user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      user: toSafeUser(req.user),
    },
  });
};

/**
 * Client logout acknowledgment
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully. Client must discard the stored JWT token.",
  });
};

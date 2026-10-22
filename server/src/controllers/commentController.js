import { z } from "zod";
import { prisma } from "../config/db.js";

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment content cannot be empty").max(5000, "Comment cannot exceed 5000 characters"),
});

/**
 * List all comments for a task
 * GET /api/tasks/:taskId/comments
 */
export const listTaskComments = async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { taskId: req.task.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Add a comment to a task
 * POST /api/tasks/:taskId/comments
 */
export const createComment = async (req, res, next) => {
  try {
    const parseResult = createCommentSchema.safeParse(req.body);
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

    const { content } = parseResult.data;

    // Author is derived strictly from authenticated user identity
    const comment = await prisma.comment.create({
      data: {
        taskId: req.task.id,
        userId: req.user.id,
        content,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: comment,
    });
  } catch (error) {
    return next(error);
  }
};

import express from "express";
import { listTaskComments, createComment } from "../controllers/commentController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireTaskAccess } from "../middleware/authorize.js";

const router = express.Router({ mergeParams: true });

router.use(requireAuth);
router.use(requireTaskAccess);

router.get("/", listTaskComments);
router.post("/", createComment);

export default router;

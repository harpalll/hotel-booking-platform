import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { allowedRoles } from "../middlewares/role.middleware";
import { submitReview } from "../controllers/reviews.controller";
import { validateData } from "../middlewares/validation.middleware";
import { submitReviewSchema } from "../schemas/review.schema";

const router = Router();

router.post("/", authMiddleware, allowedRoles(["customer"]), validateData(submitReviewSchema),submitReview);

export default router;

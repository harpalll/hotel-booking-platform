import { Router } from "express";
import { login, me, signup } from "../controllers/auth.controller";
import { validateData } from "../middlewares/validation.middleware";
import { loginSchema, signUpSchema } from "../schemas/user.schema";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/signup", validateData(signUpSchema), signup);
router.post("/login", validateData(loginSchema), login);
router.get("/me", authMiddleware, me);

export default router;

import { Router } from "express";
import { login, signup } from "../controllers/auth.controller";
import { validateData } from "../middlewares/validation.middleware";
import { loginSchema, signUpSchema } from "../schemas/user.schema";

const router = Router();

router.post("/signup", validateData(signUpSchema), signup);
router.post("/login", validateData(loginSchema), login);

export default router;

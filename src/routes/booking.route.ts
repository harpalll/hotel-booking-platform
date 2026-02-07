import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { allowedRoles } from "../middlewares/role.middleware";
import { createBooking } from "../controllers/booking.controller";
import { validateData } from "../middlewares/validation.middleware";
import { createBookingSchema } from "../schemas/booking.schema";

const router = Router();

router.post(
  "/",
  authMiddleware,
  allowedRoles(["customer"]),
  validateData(createBookingSchema),
  createBooking,
);

export default router;

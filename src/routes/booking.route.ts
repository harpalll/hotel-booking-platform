import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { allowedRoles } from "../middlewares/role.middleware";
import { cancelBooking, createBooking, getBookings } from "../controllers/booking.controller";
import { validateData } from "../middlewares/validation.middleware";
import { createBookingSchema } from "../schemas/booking.schema";

const router = Router();

router.get("/", authMiddleware, allowedRoles(["customer"]), getBookings);

router.post(
  "/",
  authMiddleware,
  allowedRoles(["customer"]),
  validateData(createBookingSchema),
  createBooking,
);

router.put(
  "/:bookingId/cancel",
  authMiddleware,
  allowedRoles(["customer"]),
  cancelBooking,
);

export default router;

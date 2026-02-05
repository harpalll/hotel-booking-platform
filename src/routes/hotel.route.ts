import { Router } from "express";
import { allowedRoles } from "../middlewares/role.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createHotel } from "../controllers/hotel.controller";
import { validateData } from "../middlewares/validation.middleware";
import {
  addRoomToHotelSchema,
  createHotelSchema,
} from "../schemas/hotel.schema";

const router = Router();

router.post(
  "/",
  authMiddleware,
  allowedRoles(["owner"]),
  validateData(createHotelSchema),
  createHotel,
);
// router.post(
//   "/:hotelid/rooms",
//   authMiddleware,
//   allowedRoles(["owner"]),
//   validateData(addRoomToHotelSchema),
//   addRoomToHotel,
// );

export default router;

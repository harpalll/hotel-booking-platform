import { StatusCodes } from "http-status-codes";
import { prisma } from "../../db";
import { asyncHandler } from "../utils/asyncHandler";
import { getCreateTimestamps } from "../utils/getDBTimestamps";
import { ApiResponse } from "../utils/ApiResponse";

export const createBooking = asyncHandler(async (req, res) => {
  const { roomId, checkInDate, checkOutDate, guests } = req.body;

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: { hotel: { select: { ownerId: true } } },
  });

  if (!room) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json(new ApiResponse(false, null, "ROOM_NOT_FOUND"));
  }

  if (Number(room.hotel.ownerId) === req.user?.id) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json(new ApiResponse(false, null, "FORBIDDEN"));
  }

  if (guests > room.maxOccupancy) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiResponse(false, null, "INVALID_CAPACITY"));
  }

  const booking = await prisma.$transaction(
    async (tx) => {
      const existringBooking = await tx.booking.findFirst({
        where: {
          roomId,
          status: "confirmed",
          AND: [
            { checkInDate: { lt: checkOut }, checkOutDate: { gt: checkIn } },
          ],
        },
      });

      if (existringBooking) return null;

      const nights =
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24);

      const totalPrice = room.pricePerNight.mul(nights);

      return tx.booking.create({
        data: {
          roomId,
          userId: req.user?.id.toString()!,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guests,
          status: "confirmed",
          bookingDate: new Date(),
          totalPrice,
          hotelId: room.hotelId,
        },
      });
    },
    { isolationLevel: "Serializable" },
  );

  if (!booking) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiResponse(false, null, "ROOM_NOT_AVAILABLE"));
  }

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(true, booking, null));
});

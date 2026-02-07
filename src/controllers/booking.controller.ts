import { StatusCodes } from "http-status-codes";
import { prisma } from "../../db";
import { asyncHandler } from "../utils/asyncHandler";
import { getCreateTimestamps } from "../utils/getDBTimestamps";
import { ApiResponse } from "../utils/ApiResponse";
import type { BookingWhereInput } from "../../generated/prisma/models";
import { BookingStatus } from "../../generated/prisma/enums";

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

export const getBookings = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const filter: BookingWhereInput = { userId: req.user?.id.toString()! };
  const bookingStatuses = Object.values(BookingStatus);

  if (bookingStatuses.includes(status as BookingStatus)) {
    filter.status = status as BookingStatus;
  }

  const userBookings = await prisma.booking.findMany({
    where: filter,
  });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(true, userBookings, null));
});

export const cancelBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId?.toString()!,
    },
  });

  if (!booking) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json(new ApiResponse(false, null, "BOOKING_NOT_FOUND"));
  }

  if (booking.userId !== req.user?.id.toString()!) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json(new ApiResponse(false, null, "FORBIDDEN"));
  }

  if (booking.status === "cancelled") {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiResponse(false, null, "ALREADY_CANCELLED"));
  }

  const now = new Date();
  const checkIn = new Date(booking.checkInDate);

  const hoursUntilCheckIn =
    (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilCheckIn < 24) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiResponse(false, null, "CANCELLATION_DEADLINE_PASSED"));
  }

  const cancelledBooking = await prisma.booking.update({
    where: { id: bookingId?.toString() },
    data: {
      status: "cancelled",
      cancelledAt: new Date(),
    },
    select: {
      id: true,
      status: true,
      cancelledAt: true,
    },
  });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(true, cancelledBooking, null));
});

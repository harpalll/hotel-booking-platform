import { StatusCodes } from "http-status-codes";
import { prisma } from "../../db";
import { asyncHandler } from "../utils/asyncHandler";
import { getDBTimestamps } from "../utils/getDBTimestamps";
import { ApiResponse } from "../utils/ApiResponse";

export const createHotel = asyncHandler(async (req, res) => {
  console.log(req.body);

  const { name, description, city, country, amenities } = req.body;

  const createdHotel = await prisma.hotel.create({
    data: {
      name,
      description,
      city,
      country,
      amenities,
      ownerId: String(req.user?.id!),
      ...getDBTimestamps(true),
    },
  });

  console.log(createdHotel);

  if (!createdHotel) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(new ApiResponse(false, null, "INTERNAL_SERVER_RESPONSE"));
  }

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(true, { data: createdHotel }, null));
});

// export const addRoomToHotel = asyncHandler(async (req, res) => {
//   const { roomNumber, roomType, pricePerNight, maxOccupancy } = req.body;

// });

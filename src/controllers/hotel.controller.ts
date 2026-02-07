import { StatusCodes } from "http-status-codes";
import { prisma } from "../../db";
import { asyncHandler } from "../utils/asyncHandler";
import { getCreateTimestamps } from "../utils/getDBTimestamps";
import { ApiResponse } from "../utils/ApiResponse";

import type {
  HotelWhereInput,
  RoomWhereInput,
} from "../../generated/prisma/models";
import { tr } from "zod/locales";

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
      ...getCreateTimestamps(),
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

export const addRoomToHotel = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const { roomNumber, roomType, pricePerNight, maxOccupancy } = req.body;

  if (!hotelId) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json(new ApiResponse(false, null, "HOTEL_NOT_FOUND"));
  }

  const existingRoom = await prisma.room.findFirst({
    where: { roomNumber: roomNumber, hotelId: hotelId?.toString() },
  });

  if (existingRoom) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(new ApiResponse(false, null, "ROOM_ALREADY_EXISTS"));
  }

  const insertedRoom = await prisma.room.create({
    data: {
      roomNumber,
      roomType,
      pricePerNight,
      maxOccupancy,
      hotelId: hotelId.toString(),
      ...getCreateTimestamps(),
    },
  });

  if (!insertedRoom) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(new ApiResponse(false, null, "INTERNAL_SERVER_ERROR"));
  }

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(true, insertedRoom, null));
});

export const getHotels = asyncHandler(async (req, res) => {
  const { city, country, minPrice, maxPrice, minRating } = req.query;

  const cleanedCity = city?.toString().replace("%20", " ");

  const where: HotelWhereInput = {};
  city && (where.city = { equals: cleanedCity, mode: "insensitive" });
  country &&
    (where.country = { equals: country.toString(), mode: "insensitive" });
  minRating && (where.rating = { gte: Number(minRating) });

  const roomWhere: RoomWhereInput = {};

  if (minPrice || maxPrice) {
    roomWhere.pricePerNight = {};
    if (minPrice) roomWhere.pricePerNight.gte = Number(minPrice);
    if (maxPrice) roomWhere.pricePerNight.lte = Number(maxPrice);
  }

  if (Object.keys(roomWhere).length > 0) {
    (where as any).rooms = {
      some: roomWhere,
    };
  }

  const hotelList = await prisma.hotel.findMany({
    where,
    select: {
      id: true,
      name: true,
      description: true,
      city: true,
      country: true,
      amenities: true,
      rating: true,
      totalReviews: true,
      rooms: {
        where: roomWhere,
        orderBy: { pricePerNight: "asc" },
        take: 1,
        select: { pricePerNight: true },
      },
    },
  });

  const finalList = hotelList.map(({ rooms, ...hotel }) => ({
    ...hotel,
    minPricePerNight: rooms[0]?.pricePerNight ?? 0,
  }));

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(true, finalList, null));
});

export const getRoomsByHotels = asyncHandler(async (req, res) => {
  const { hotelId } = req.params;
  const hotel = await prisma.hotel.findFirst({
    where: { id: hotelId?.toString() },
    select: {
      id: true,
      name: true,
      ownerId: true,
      description: true,
      city: true,
      country: true,
      amenities: true,
      rating: true,
      totalReviews: true,
      rooms: {
        select: {
          id: true,
          roomNumber: true,
          roomType: true,
          pricePerNight: true,
          maxOccupancy: true,
        },
      },
    },
  });

  if (!hotel) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json(new ApiResponse(false, null, "HOTEL_NOT_FOUND"));
  }

  return res.status(StatusCodes.OK).json(new ApiResponse(true, hotel, null));
});

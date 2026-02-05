import z from "zod";

export const createHotelSchema = z.object({
  name: z.string({ error: "please enter name" }),
  description: z.string({ error: "please enter description" }),
  city: z.string({ error: "please enter city" }),
  country: z.string({ error: "please enter city" }),
  amenities: z.array(z.string({ error: "please enter string only" })),
});

export const addRoomToHotelSchema = z.object({
  roomNumber: z.string({ error: "please enter room number" }),
  roomType: z.string({ error: "please enter room type" }),
  pricePerNight: z.number({ error: "please enter price per night" }),
  maxOccupancy: z.number({ error: "please enter max Occupancy" }),
});

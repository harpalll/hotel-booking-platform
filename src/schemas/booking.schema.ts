import z from "zod";

export const createBookingSchema = z
  .object({
    roomId: z.string({ error: " required " }),
    checkInDate: z.coerce.date({ error: "please enter checkInDate date" }),
    checkOutDate: z.coerce.date({ error: "please enter checkOutDate date" }),
    guests: z.number().min(1, { error: "Minimum 1 guest is required" }),
  })
  .refine((data) => data.checkOutDate > data.checkInDate, {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"],
  })
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return data.checkInDate > today;
    },
    {
      message: "Check-in date must be in future",
      path: ["checkInDate"],
    },
  );

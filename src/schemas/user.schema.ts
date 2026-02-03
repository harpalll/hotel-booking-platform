import z from "zod";

export const signUpSchema = z.object({
  name: z.string({ error: "please enter name " }),
  email: z.email({ error: "please enter valid mail" }),
  password: z.string({ error: "please enter password" }).min(6, {
    error: "password must be minimum of 6 chars",
  }),
  role: z.enum(["customer", "owner"], {
    error: "please enter a role ('customer', 'owner')",
  }),
  phone: z
    .string({ error: "please enter a phone number" })
    .min(10, { error: "please enter valid number" }),
});

export const loginSchema = z.object({
  email: z.string({ error: "please enter a mail" }).email({
    error: "please enter valid mail",
  }),
  password: z.string({ error: "please enter password" }).min(6, {
    error: "password must be minimum of 6 chars",
  }),
});

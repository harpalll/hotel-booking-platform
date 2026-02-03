import { config } from "../../config";
import { prisma } from "../../db";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res
      .status(400)
      .json(new ApiResponse(false, null, "EMAIL_ALREADY_EXISTS"));
  }

  const hashedPassword = await bcrypt.hash(password, config.SALT_ROUNDS);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  if (!newUser) {
    return res
      .status(500)
      .json(new ApiResponse(false, null, "INTERNAL_SERVER_ERROR"));
  }

  return res.status(201).json({
    success: true,
    message: "User registered successully",
    data: newUser,
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  const hashedPassword =
    existingUser?.password ?? "$2b$10$invalidsaltinvalidsaltinvalidsa"; // This prevents user enumeration attacks.

  const isValid = bcrypt.compare(password, hashedPassword);

  if (!existingUser || !isValid) {
    return res
      .status(401)
      .json(new ApiResponse(false, null, "INVALID_CREDENTIALS"));
  }

  if (!config.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const jwtPayload = {
    id: existingUser.id,
    email: existingUser.email,
    name: existingUser.name,
    role: existingUser.role,
  };

  const token = jwt.sign(jwtPayload, config.JWT_SECRET, {
    expiresIn: "1d",
  });

  if (!token) {
    return res
      .status(500)
      .json(new ApiResponse(false, null, "INTERNAL_SERVER_ERROR"));
  }

  return res
    .status(200)
    .json(new ApiResponse(true, { token, user: jwtPayload }, null));
});

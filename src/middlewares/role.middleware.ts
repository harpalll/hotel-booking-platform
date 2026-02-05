import type { UserRole } from "../../generated/prisma/enums";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const allowedRoles = (allowedRoles: UserRole[]) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(new ApiResponse(false, null, "UNAUTHORIZED"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(new ApiResponse(false, null, "FORBIDDEN"));
    }

    next();
  });
};

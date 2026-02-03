import { UserRole } from "./generated/prisma/client";

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      name: string;
      role: UserRole;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};

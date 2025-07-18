import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import asyncHandler from "express-async-handler";
import { AuthenticationError } from "./errorMiddleware";

const authenticate = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let token = req.cookies.jwt;

      if (!token) {
        throw new AuthenticationError("Token not found");
      }

      const jwtSecret = process.env.JWT_SECRET || "";
      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

      if (!decoded || !decoded.userId) {
        throw new AuthenticationError("UserId not found");
      }

      const user = await User.findById(decoded.userId, "_id firstName lastName email");

      if (!user) {
        throw new AuthenticationError("User not found");
      }

      req.user = {
        _id: String(user._id),
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };
      next();
    } catch (e) {
      throw new AuthenticationError("Invalid token");
    }
  }
);

export { authenticate };
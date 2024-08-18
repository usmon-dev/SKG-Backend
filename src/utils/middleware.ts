/**
 * Middleware function to verify the API key in the request headers.
 * If the API key is missing or invalid, it returns a 401 Unauthorized response.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */

/**
 * Middleware function to verify the JWT token in the request headers.
 * If the token is missing or invalid, it returns a 401 Unauthorized response.
 * If the token is valid, it sets the `userId` property on the request object.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */

/**
 * Middleware function to verify the JWT token in the request headers and check if the user is an admin.
 * If the token is missing or invalid, it returns a 401 Unauthorized response.
 * If the token is valid but the user is not an admin, it returns a 403 Forbidden response.
 * If the token is valid and the user is an admin, it sets the `userId` property on the request object.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function in the stack.
 */
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";

interface DecodedUser {
  id: string;
  isAdmin?: boolean;
}

const secretKey: string = process.env.JWT_SECRET || "";

export const apiKeyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.header("X-API-Key");

  if (apiKey && apiKey == process.env.API_SECRET_KEY) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "No token provided user" });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as DecodedUser;
    (req as any).userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const verifyAdminToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ error: "No token provided admin" });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as DecodedUser;
    if (!decoded.isAdmin) {
      return res
        .status(403)
        .json({ error: "Access denied. Admin privileges required." });
    }
    (req as any).userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

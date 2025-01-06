/**
 * Defines the routes for user-related functionality in the application.
 * 
 * The following routes are available:
 * 
 * GET /users/myself - Retrieves the currently authenticated user's information
 * PUT /users/myself - Updates the currently authenticated user's information
 * DELETE /users/myself - Deletes the currently authenticated user
 * 
 * POST /users/register - Registers a new user
 * POST /users/login - Authenticates a user and returns a session token
 * 
 * GET /users - Retrieves a list of all users
 * GET /users/:id - Retrieves a specific user by their ID
 * PUT /users/:id - Updates a specific user by their ID
 * DELETE /users/:id - Deletes a specific user by their ID
 */
import { Router } from "express";
import {
  addSkToFav,
  deleteMyself,
  deleteUser,
  getMyself,
  getUserById,
  getUsers,
  loginUser,
  registerUser,
  updateMyself,
  updateUser,
} from "../controllers/users.controller";

const router = Router();

router.get("/myself", getMyself);
router.put("/myself", updateMyself);
router.delete("/myself", deleteMyself);

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

router.post("/addsktofav/:skId", addSkToFav);

export default router;
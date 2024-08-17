import { Router } from "express";
import {
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

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/myself", getMyself);
router.put("/myself", updateMyself);
router.delete("/myself", deleteMyself);

export default router;
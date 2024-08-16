import { Router } from "express";
import {
  SecretKeyGenerator,
  createSecretKey,
  deleteSecretKey,
  getSecretKey,
  getSecretKeys,
  updateSecretKey,
} from "../controllers/skg.controller";

const router = Router();

router.post("/generate", SecretKeyGenerator);
router.post("/", createSecretKey);
router.get("/", getSecretKeys);
router.get("/:id", getSecretKey);
router.put("/:id", updateSecretKey);
router.delete("/:id", deleteSecretKey);

export default router;

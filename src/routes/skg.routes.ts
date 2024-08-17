/**
 * Defines the routes for the Secret Key Generator (SKG) API.
 * 
 * The following routes are available:
 * - `POST /generate`: Generates a new secret key.
 * - `POST /`: Creates a new secret key.
 * - `GET /`: Retrieves all secret keys.
 * - `GET /:id`: Retrieves a specific secret key by its ID.
 * - `PUT /:id`: Updates a specific secret key by its ID.
 * - `DELETE /:id`: Deletes a specific secret key by its ID.
 */
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

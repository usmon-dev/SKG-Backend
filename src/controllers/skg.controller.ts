/**
 * Generates a random secret key.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} - A JSON response with the generated secret key.
 */
// export const SecretKeyGenerator = async (req: Request, res: Response) => {
  // ...
// };

/**
 * Creates a new secret key.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} - A JSON response with the created secret key.
 */
// export const createSecretKey = [
//   verifyToken,
//   async (req: Request, res: Response) => {
//     // ...
//   },
// ];

/**
 * Retrieves the list of secret keys for the authenticated user.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} - A JSON response with the list of secret keys.
 */
// export const getSecretKeys = [
//   verifyToken,
//   async (req: Request, res: Response) => {
//     // ...
//   },
// ];

/**
 * Retrieves a specific secret key.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} - A JSON response with the requested secret key.
 */
// export const getSecretKey = [
//   verifyToken,
//   async (req: Request, res: Response) => {
//     // ...
//   },
// ];

/**
 * Updates a specific secret key.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} - A JSON response with the updated secret key.
 */
// export const updateSecretKey = [
//   verifyToken,
//   async (req: Request, res: Response) => {
//     // ...
//   },
// ];

/**
 * Deletes a specific secret key.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @returns {Promise<void>} - A JSON response indicating the successful deletion.
 */
// export const deleteSecretKey = [
//   verifyToken,
//   async (req: Request, res: Response) => {
//     // ...
//   },
// ];
import { Request, Response } from "express";
import crypto from "crypto";
import { db } from "../config";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { verifyToken } from "../utils/middleware";

const secretKeysCollection = collection(db, "secret_keys");

export const SecretKeyGenerator = async (req: Request, res: Response) => {
  try {
    const secretKey = crypto.randomBytes(32).toString("hex");
    return res.status(200).json({ secretKey });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createSecretKey = [
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { title } = req.body;
      const secretKey = crypto.randomBytes(32).toString("hex");
      const userId = (req as any).userId;
      const newSecretKey = await addDoc(secretKeysCollection, {
        title,
        secretKey,
        userId,
      });
      return res
        .status(201)
        .json({ id: newSecretKey.id, title, secretKey, userId });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];
export const getSecretKeys = [
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const secretKeys = await getDocs(secretKeysCollection);
      const secretKeyList = secretKeys.docs
        .filter((doc) => doc.data().userId === userId)
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      return res.status(200).json(secretKeyList);
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

export const getSecretKey = [
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      const secretKeyDoc = await getDoc(doc(secretKeysCollection, id));
      if (!secretKeyDoc.exists()) {
        return res.status(404).json({ error: "Secret key not found" });
      }
      const secretKeyData = secretKeyDoc.data();
      if (secretKeyData.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access" });
      }
      return res.status(200).json({ id: secretKeyDoc.id, ...secretKeyData });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

export const updateSecretKey = [
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const userId = (req as any).userId;
      const secretKeyRef = doc(secretKeysCollection, id);
      const secretKeyDoc = await getDoc(secretKeyRef);
      if (!secretKeyDoc.exists()) {
        return res.status(404).json({ error: "Secret key not found" });
      }
      const secretKeyData = secretKeyDoc.data();
      if (secretKeyData.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access" });
      }
      await updateDoc(secretKeyRef, { title });
      const updatedSecretKey = await getDoc(secretKeyRef);
      return res
        .status(200)
        .json({ id: updatedSecretKey.id, ...updatedSecretKey.data() });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

export const deleteSecretKey = [
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = (req as any).userId;
      const secretKeyRef = doc(secretKeysCollection, id);
      const secretKeyDoc = await getDoc(secretKeyRef);
      if (!secretKeyDoc.exists()) {
        return res.status(404).json({ error: "Secret key not found" });
      }
      const secretKeyData = secretKeyDoc.data();
      if (secretKeyData.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access" });
      }
      await deleteDoc(secretKeyRef);
      return res
        .status(200)
        .json({ message: "Secret key deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];
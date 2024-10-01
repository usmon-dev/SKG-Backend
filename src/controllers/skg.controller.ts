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

interface SecretKey {
  id: string;
  title: string;
  secretKey: string;
  userId: string;
  createdAt: string;
}

interface RequestWithUserId extends Request {
  userId: string;
}

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
      const userId = (req as RequestWithUserId).userId;
      const createdAt = new Date().toISOString();
      const newSecretKey = await addDoc(secretKeysCollection, {
        title,
        secretKey,
        userId,
        createdAt,
      });
      const createdSecretKey: SecretKey = {
        id: newSecretKey.id,
        title,
        secretKey,
        userId,
        createdAt,
      };
      return res.status(201).json(createdSecretKey);
    } catch (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  },
];

export const getSecretKeys = [
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userId = (req as RequestWithUserId).userId;
      const secretKeys = await getDocs(secretKeysCollection);
      const secretKeyList: SecretKey[] = secretKeys.docs
        .filter((doc) => doc.data().userId === userId)
        .map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<SecretKey, "id">),
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
      const userId = (req as RequestWithUserId).userId;
      const secretKeyDoc = await getDoc(doc(secretKeysCollection, id));
      if (!secretKeyDoc.exists()) {
        return res.status(404).json({ error: "Secret key not found" });
      }
      const secretKeyData = secretKeyDoc.data() as Omit<SecretKey, "id">;
      if (secretKeyData.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access" });
      }
      const secretKey: SecretKey = { id: secretKeyDoc.id, ...secretKeyData };
      return res.status(200).json(secretKey);
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
      const userId = (req as RequestWithUserId).userId;
      const secretKeyRef = doc(secretKeysCollection, id);
      const secretKeyDoc = await getDoc(secretKeyRef);
      if (!secretKeyDoc.exists()) {
        return res.status(404).json({ error: "Secret key not found" });
      }
      const secretKeyData = secretKeyDoc.data() as Omit<SecretKey, "id">;
      if (secretKeyData.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized access" });
      }
      await updateDoc(secretKeyRef, { title });
      const updatedSecretKeyDoc = await getDoc(secretKeyRef);
      const updatedSecretKey: SecretKey = {
        id: updatedSecretKeyDoc.id,
        ...(updatedSecretKeyDoc.data() as Omit<SecretKey, "id">),
      };
      return res.status(200).json(updatedSecretKey);
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
      const userId = (req as RequestWithUserId).userId;
      const secretKeyRef = doc(secretKeysCollection, id);
      const secretKeyDoc = await getDoc(secretKeyRef);
      if (!secretKeyDoc.exists()) {
        return res.status(404).json({ error: "Secret key not found" });
      }
      const secretKeyData = secretKeyDoc.data() as Omit<SecretKey, "id">;
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

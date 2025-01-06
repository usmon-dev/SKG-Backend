/**
 * Handles user registration, login, and CRUD operations for users.
 *
 * The `usersController` module provides the following functionality:
 *
 * - `registerUser`: Registers a new user by creating a new document in the "users" collection in Firestore. It checks if the user already exists, hashes the password, and returns a JWT token.
 * - `loginUser`: Authenticates a user by checking the username and password, and returns a JWT token if the credentials are valid.
 * - `getUsers`: Retrieves a list of all users. This endpoint is restricted to admin users only.
 * - `getUserById`: Retrieves a user by their ID. This endpoint is restricted to admin users only.
 * - `updateUser`: Updates a user's information. This endpoint is restricted to admin users only.
 * - `deleteUser`: Deletes a user. This endpoint is restricted to admin users only.
 * - `getMyself`: Retrieves the currently authenticated user's information.
 * - `updateMyself`: Updates the currently authenticated user's information.
 * - `deleteMyself`: Deletes the currently authenticated user.
 *
 * The module uses Firebase Firestore for data storage and JWT for authentication.
 */
import { Request, Response } from "express";
import { db } from "../config";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  arrayUnion,
} from "firebase/firestore";
import { verifyToken, verifyAdminToken } from "../utils/middleware";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import { getFormattedDateAndTime } from "../utils/defaults";
import { getSecretKey } from "./skg.controller";

const usersCollection = collection(db, "users");
const secretKeysCollection = collection(db, "secret_keys");

const JWT_SECRET = process.env.JWT_SECRET || "";

interface favSK {
  skId: string;
  addedAt: string;
}

interface User {
  name: string;
  surname: string;
  username: string;
  password: string;
  isAdmin: boolean;
  createdAt: string;
  favSK: favSK[];
}

interface UserInput {
  name: string;
  surname?: string;
  username: string;
  password: string;
  isAdmin?: boolean;
  createdAt?: string;
  favSK?: favSK[];
}

interface UserUpdate {
  name?: string;
  surname?: string;
  username?: string;
  password?: string;
  isAdmin?: boolean;
  createdAt?: string;
  favSK?: favSK[];
}

interface LoginInput {
  username: string;
  password: string;
}

interface JwtPayload {
  id: string;
  isAdmin: boolean;
}

// Register user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, surname, username, password, isAdmin } =
      req.body as UserInput;

    // Check if user already exists
    const userQuery = query(usersCollection, where("username", "==", username));
    const userDocs = await getDocs(userQuery);

    if (!userDocs.empty) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await addDoc(usersCollection, {
      name,
      surname: surname || "",
      username,
      password: hashedPassword,
      isAdmin: isAdmin || false,
      createdAt: getFormattedDateAndTime(),
    });

    const token = jwt.sign(
      { id: newUser.id, isAdmin: isAdmin || false } as JwtPayload,
      JWT_SECRET
    );

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body as LoginInput;

    const userQuery = query(usersCollection, where("username", "==", username));
    const userDocs = await getDocs(userQuery);

    if (userDocs.empty) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = userDocs.docs[0].data() as User;
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: userDocs.docs[0].id, isAdmin: user.isAdmin } as JwtPayload,
      JWT_SECRET
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
};

// Get all users
export const getUsers = [
  verifyAdminToken,
  async (req: Request, res: Response) => {
    try {
      const usersQuery = query(usersCollection, orderBy("createdAt", "desc"));
      const users = await getDocs(usersQuery);
      const userList = users.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      res.json(userList);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users", error });
    }
  },
];

// Get user by ID
export const getUserById = [
  verifyAdminToken,
  async (req: Request, res: Response) => {
    try {
      const userDoc = await getDoc(doc(usersCollection, req.params.id));
      if (!userDoc.exists()) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: userDoc.id, ...userDoc.data() });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user", error });
    }
  },
];

// Update user
export const updateUser = [
  verifyAdminToken,
  async (req: Request, res: Response) => {
    try {
      const { name, surname, username, isAdmin, password } =
        req.body as UserUpdate;
      const userDoc = doc(usersCollection, req.params.id);

      const updateData: Partial<UserUpdate> = {
        name,
        surname,
        username,
        isAdmin,
      };

      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        updateData.password = hashedPassword;
      }

      await updateDoc(userDoc, updateData);
      res.json({ message: "User updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error });
    }
  },
];

// Delete user
export const deleteUser = [
  verifyAdminToken,
  async (req: Request, res: Response) => {
    try {
      await deleteDoc(doc(usersCollection, req.params.id));
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user", error });
    }
  },
];

// Get myself
export const getMyself = [
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const userDoc = await getDoc(doc(usersCollection, (req as any).userId));
      if (!userDoc.exists()) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: userDoc.id, ...userDoc.data() });
    } catch (error) {
      res.status(500).json({ message: "Error fetching user", error });
    }
  },
];

// Update myself
export const updateMyself = [
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const { name, surname, username, password } = req.body as UserUpdate;
      const userDoc = doc(usersCollection, (req as any).userId);

      const updateData: Partial<UserUpdate> = { name, surname, username };

      if (password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        updateData.password = hashedPassword;
      }

      await updateDoc(userDoc, updateData);
      res.json({ message: "User updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error updating user", error });
    }
  },
];

// Delete myself
export const deleteMyself = [
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      await deleteDoc(doc(usersCollection, (req as any).userId));
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting user", error });
    }
  },
];

// add sk to favourites
export const addSkToFav = [
  verifyToken,
  async (req: Request, res: Response) => {
    try {
      const skId = req.params.skId;
      const secretKeyDoc = await getDoc(doc(secretKeysCollection, skId));
      if (secretKeyDoc.exists()) {
        const userDoc = doc(usersCollection, (req as any).userId);
        const user = getDoc(userDoc);
        const userData = (await user).data() as User;
        if (userData.favSK.find((fav) => fav.skId === skId)) {
          return res
            .status(400)
            .json({ message: "Secret key already in favourites" });
        } else {
          await updateDoc(userDoc, {
            favSK: [
              ...userData.favSK,
              { skId, addedAt: getFormattedDateAndTime() },
            ],
          });
          res.json({ message: "Secret key added to favourites" });
        }
      } else {
        res.status(404).json({ message: "Secret key not found" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error adding secret key to favourites", error });
    }
  },
];

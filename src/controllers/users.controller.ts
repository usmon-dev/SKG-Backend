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
} from "firebase/firestore";
import { verifyToken, verifyAdminToken } from "../utils/middleware";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";

const usersCollection = collection(db, "users");

const JWT_SECRET = process.env.JWT_SECRET || "";

interface User {
  name: string;
  surname: string;
  username: string;
  password: string;
  isAdmin: boolean;
}

// Register user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, surname, username, password, isAdmin } = req.body as User;

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
    });

    const token = jwt.sign({ id: newUser.id, isAdmin }, JWT_SECRET);

    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
};

// Login user
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

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
      { id: userDocs.docs[0].id, isAdmin: user.isAdmin },
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
      const users = await getDocs(usersCollection);
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
        req.body as Partial<User>;
      const userDoc = doc(usersCollection, req.params.id);

      const updateData: Partial<User> = { name, surname, username, isAdmin };

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
      const { name, surname, username, password } = req.body as Partial<User>;
      const userDoc = doc(usersCollection, (req as any).userId);

      const updateData: Partial<User> = { name, surname, username };

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

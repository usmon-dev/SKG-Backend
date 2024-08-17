/**
 * This is the main entry point for the server application. It sets up the Express.js server, configures middleware, and defines the routes for the API.
 *
 * The server listens on the port specified by the `PORT` environment variable, or defaults to port 3000 if the environment variable is not set.
 *
 * The server uses the following middleware:
 * - `cors`: Enables CORS (Cross-Origin Resource Sharing) to allow requests from other domains.
 * - `express.json`: Parses incoming JSON data in the request body.
 * - `express.urlencoded`: Parses incoming URL-encoded data in the request body.
 * - `apiKeyMiddleware`: Middleware that checks for a valid API key in the request headers.
 *
 * The server defines the following routes:
 * - `GET /`: Responds with a welcome message if the API key is valid.
 * - `/api/skg`: Routes defined in the `skgRoutes` module.
 * - `/api/users`: Routes defined in the `usersRoutes` module.
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import { apiKeyMiddleware } from "./utils/middleware";
import skgRoutes from "./routes/skg.routes";
import usersRoutes from "./routes/users.routes";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const PORT = process.env.PORT || 3000;

app.get("/", apiKeyMiddleware, (req, res) => {
  res.json({ message: "Welcome to the API!" });
});

app.use(apiKeyMiddleware);
app.use("/api/skg", skgRoutes);
app.use("/api/users", usersRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
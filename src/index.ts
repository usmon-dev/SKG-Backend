import "dotenv/config";
import express from "express";
import cors from "cors";
import { apiKeyMiddleware } from "./utils/middleware";
import skgRoutes from "./routes/skg.routes";

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
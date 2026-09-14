import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import CheckHealth from "./utils/health";

const app = express();
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import AuthRoutes from "./feature/auth/auth.routes";
import { errorHandler } from "./middleware/error";

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
  });
});
app.get("/health", CheckHealth);
app.use("/api/v1/auth", AuthRoutes);
app.use(errorHandler);
export default app;

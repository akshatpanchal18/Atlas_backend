import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";

const app = express();
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    timestamp: new Date().toISOString(),
  });
});
export default app;

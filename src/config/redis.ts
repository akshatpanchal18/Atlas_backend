import { logger } from "./pino";
import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("connect", () => {
  logger.info("Redis Connected");
});

redisClient.on("ready", () => {
  logger.info("Redis Ready");
});

redisClient.on("error", (err) => {
  logger.error("Redis Error:", err);
});

redisClient.on("end", () => {
  logger.fatal("Redis Disconnected");
});

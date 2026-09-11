import env from "dotenv";
import { logger } from "./config/pino";
import app from "./app";
import { redisClient } from "./config/redis";
env.config({ path: ".env", quiet: true, override: true });

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await redisClient.connect();
  logger.info(`server is running  http://localhost:${PORT}`);
});

import env from "dotenv";
import { logger } from "./config/pino";
import app from "./app";
env.config({ path: ".env", quiet: true, override: true });

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  logger.info(`server is running  http://localhost:${PORT}`);
});

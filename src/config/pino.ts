import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

export const logger = pino({
  level: "info",

  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
});
// logger.info("Server Started");
// logger.error("error",{error});
// logger.fatal("error");
// logger.warn("Warning");

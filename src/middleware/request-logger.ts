import pinoHttp from "pino-http";
import { logger } from "../config/pino";

export const requestLogger = pinoHttp({
  logger,

  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },

  customErrorMessage: (req, res, error) => {
    return `${req.method} ${req.url} ${res.statusCode} ==> ${error.message}`;
  },

  serializers: {
    req: () => undefined,
    res: () => undefined,
  },
});

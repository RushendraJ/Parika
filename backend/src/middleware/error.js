import multer from "multer";

import { isProd } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export const notFound = (req, _res, next) => next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.status || 500;
  let message = err.message || "Something went wrong";

  if (err instanceof multer.MulterError) {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "Image must be 5 MB or smaller" : err.message;
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  } else if (err.code === 11000) {
    status = 409;
    message = "That already exists";
  }

  if (status >= 500) {
    console.error(err);
    if (isProd) message = "Something went wrong on our end";
  }
  res.status(status).json({ message, ...(err.details ? { details: err.details } : {}) });
}

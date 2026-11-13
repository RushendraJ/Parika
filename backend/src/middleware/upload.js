import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import multer from "multer";

import { ApiError } from "../utils/ApiError.js";

export const uploadDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const ALLOWED = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${ALLOWED[file.mimetype]}`),
});

/** Single product photo in the `image` field. */
export const uploadProductImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    ALLOWED[file.mimetype] ? cb(null, true) : cb(ApiError.badRequest("Only JPG, PNG or WebP images are allowed")),
}).single("image");

export function removeUpload(imageUrl) {
  if (!imageUrl?.startsWith("/uploads/")) return;
  const file = path.join(uploadDir, path.basename(imageUrl));
  fs.promises.unlink(file).catch(() => {});
}

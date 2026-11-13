import compression from "compression";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env, isProd } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { uploadDir } from "./middleware/upload.js";
import routes from "./routes/index.js";

const app = express();

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })); // uploads are shown on the frontend origin
app.use(
  cors({
    origin: (origin, cb) => cb(null, !origin || env.clientUrls.includes(origin)),
  }),
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
if (!isProd) app.use(morgan("dev"));

app.use("/uploads", express.static(uploadDir, { maxAge: "7d" }));
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;

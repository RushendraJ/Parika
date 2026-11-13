import app from "./app.js";
import { connectDB } from "./config/db.js";
import { assertEnv, env } from "./config/env.js";

assertEnv();

try {
  await connectDB();
  app.listen(env.port, () => console.log(`Parika API running on http://localhost:${env.port}`));
} catch (err) {
  console.error("Could not start the server:", err.message);
  process.exit(1);
}

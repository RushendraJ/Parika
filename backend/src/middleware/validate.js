import { ApiError } from "../utils/ApiError.js";

/** validate(schema, "body" | "params" | "query") - replaces the request part with the parsed value. */
export const validate = (schema, part = "body") => (req, _res, next) => {
  const result = schema.safeParse(req[part]);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Invalid input";
    return next(ApiError.badRequest(message, result.error.flatten().fieldErrors));
  }
  req[part] = result.data;
  next();
};

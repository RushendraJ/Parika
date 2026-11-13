/** Exposes `id` instead of `_id`/`__v` in JSON responses. */
export function cleanJson(schema) {
  schema.set("toJSON", {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      ret.id = String(ret._id);
      delete ret._id;
      delete ret.passwordHash;
      delete ret.resetTokenHash;
      delete ret.resetTokenExpires;
      return ret;
    },
  });
}

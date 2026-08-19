const mongoose = require("mongoose");

// Stores only a SHA-256 hash of the reset token (never the raw token) so a
// database leak alone can't be used to reset an account. Documents expire
// automatically via a TTL index once `expires` passes.
const passwordResetSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true },
    expires: { type: Date, required: true }
  },
  { timestamps: true }
);

passwordResetSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PasswordReset", passwordResetSchema);

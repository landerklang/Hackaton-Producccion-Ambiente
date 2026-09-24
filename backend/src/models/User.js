const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      validate: {
        validator: (value) => !/\s/.test(value),
        message: "El nombre de usuario no puede contener espacios.",
      },
      match: /^[a-z0-9._-]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message: "El email no tiene un formato válido.",
      },
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["client", "producer"],
    },
  },
  {
    timestamps: true,
  },
);

userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Profile",
  new mongoose.Schema(
    {
      _id: { type: Number, required: true },
      email: { type: String, required: true, unique: true },
      password: String,
      profile: Map,
      address: Map,
      program: Map,
      uploads: Map,
      payment: Map,
      secondary: Map,
      postsecondary: Array,
    },
    { timestamps: true, versionKey: false }
  )
);

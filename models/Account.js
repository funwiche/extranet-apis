const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Account",
  new mongoose.Schema(
    {
      _id: { type: Number, required: true },
      email: { type: String, required: true, unique: true },
      password: String,
      profile: Map,
      address: Map,
      statement: Array,
      account: Map,
      card: Map,
      loggedin: Date,
    },
    { timestamps: true, versionKey: false }
  )
);

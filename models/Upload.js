const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Upload",
  new mongoose.Schema(
    {
      _id: { type: String, required: true },
      file: String,
      profile: Number,
      fieldname: String,
    },
    { versionKey: false }
  )
);

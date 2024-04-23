const mongoose = require("mongoose");

module.exports = mongoose.model(
  "Account",
  new mongoose.Schema(
    {
      _id: { type: Number, required: true },
      email: { type: String, required: true, unique: true },
      password: String,
      account: String,
      routing: String,
      lname: String,
      fname: String,
      gender: String,
      dob: String,
      profession: String,
      nationality: String,
      photo: String,
      phone: String,
      author: String,
      address: Map,
      statement: Array,
      details: Map,
      card: Map,
      loggedin: Date,
    },
    { timestamps: true, versionKey: false }
  )
);

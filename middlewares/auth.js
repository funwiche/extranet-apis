require("dotenv").config();
const JWT = require("jsonwebtoken");
const SECRET = process.env.ACCESS_TOKEN_SECRET;
const Profile = require("../models/Profile");
const Account = require("../models/Account");

/** Verify Token */
module.exports = (req, res, next) => {
  const auth_header = req.headers["authorization"];
  const token = auth_header && auth_header.split(" ")[1];
  if (token == null) return res.json([false, "You are not authorized"]);
  JWT.verify(token, SECRET, async (err, uid) => {
    if (err) return res.json([false, "You are not authorized"]);
    if (!((await Profile.findById(uid)) || (await Account.findById(uid))))
      return res.json([false, "Profile not found"]);
    req.uid = uid;
    next();
  });
};

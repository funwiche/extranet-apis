require("dotenv").config();
const express = require("express");
const router = express.Router();
const Account = require("../models/Account");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const SECRET = process.env.ACCESS_TOKEN_SECRET;
const auth = require("../middlewares/auth");
const nodemailer = require("nodemailer");
const user = "contact@swiftforwarding.com";
const from = "HSBC Online Banking <contact@swiftforwarding.com>";
const transport = {
  auth: { user, pass: process.env.PASS },
  host: "mail.privateemail.com",
  secure: true,
  port: 465,
};
const project = { password: 0 };
const { parsed } = require("../utils/index");
// Get Auth Profile
router.get("", auth, async (req, res) => {
  try {
    res.json([await Account.findById(req.uid, project), false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Get profile by ID
router.get("/all", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "12");
    const skip = parseInt(req.query.skip || "0");
    const total = await Account.find().count();
    const items = await Account.find({}, project).skip(skip).limit(limit);
    res.json([{ items, total, limit, skip }, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Get profile by ID
router.get("/:id", async (req, res) => {
  try {
    res.json([await Account.findById(req.params.id, project), false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Sign up
router.post("/create", async (req, res) => {
  try {
    const _id = Date.now();
    let { email, ...body } = req.body;
    if (await Account.findOne({ email }))
      return res.json([false, "Email already exist"]);
    const profile = new Account({ _id, email, ...body });
    await profile.save();
    res.json([profile, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Login
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    let profile = await Account.findOne({ email });
    if (!profile) return res.json([false, "Email not found"]);
    if (!(await bcrypt.compare(password, profile.password)))
      return res.json([false, "Incorrect password"]);
    const token = JWT.sign(profile._id, SECRET);
    profile = await Account.findById(profile._id, project);
    await Account.updateOne(
      { _id: profile._id },
      { $set: { loggedin: Date.now() } },
      { upsert: true }
    );
    res.json([{ token, profile }, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Register
router.post("/register", async (req, res) => {
  try {
    const expiry = Date.now() + 7.2e6;
    const { account, email, phone, dob } = req.body;
    const cove = await Account.findOne({
      email,
      phone,
      "profile.dob": dob,
      "account.number": account,
    });
    if (!cove) return res.json([false, "Invalid email"]);
    const { _id, profile } = parsed(cove);
    const token = JWT.sign({ _id, expiry }, SECRET);
    const html = `<p>Dear ${profile.fname} ${profile.lname},<br><br>You can complete your Online Banking Registration with the following url:&nbsp;<a href="http://dashboard.nsuni.co.uk/reset?token=${token}" target="_blank">http://dashboard.nsuni.co.uk/reset?token=${token}</a><br>This url will be valid for two hours. If you have not completed your registration during this period, you will have to restart the process all over.<br>If you did not request a password reset, you can ignore this email.<br><br>Best regards</p>`;
    const subject = "HSBC Online Banking: Registration";
    await nodemailer
      .createTransport(transport)
      .sendMail({ from, to: email, replyTo: user, subject, html });
    res.json([token, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});

// Forgot password
router.post("/password/forgot", async (req, res) => {
  try {
    const expiry = Date.now() + 7.2e6;
    const { account, email, dob } = req.body;
    const cove = await Account.findOne({
      email,
      "profile.dob": dob,
      "account.number": account,
    });
    if (!cove) return res.json([false, "Invalid email"]);
    const { _id, profile } = parsed(cove);
    const token = JWT.sign({ _id, expiry }, SECRET);
    const html = `<p>Dear ${profile.fname} ${profile.lname},<br><br>You can reset your password with the following url:&nbsp;<a href="http://dashboard.nsuni.co.uk/reset?token=${token}" target="_blank">http://dashboard.nsuni.co.uk/reset?token=${token}</a><br>This url will be valid for two hours. If you have not reset your password during this period, you will have to request a new url.<br>If you did not request a password reset, you can ignore this email.<br><br>Best regards</p>`;
    const subject = "Password recovery";
    await nodemailer
      .createTransport(transport)
      .sendMail({ from, to: email, replyTo: user, subject, html });
    res.json([token, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Forgot Expiry
router.post("/password/expiry", async (req, res) => {
  try {
    const now = Date.now();
    const auth_header = req.headers["authorization"];
    const token = auth_header && auth_header.split(" ")[1];
    if (token == null) return res.json([false, "Invalid reset password link"]);
    JWT.verify(token, SECRET, async (err, user) => {
      if (err) return res.json([false, "Invalid reset password link"]);
      if (!(await Account.findById(user._id)))
        return res.json([false, "Profile not found"]);
      if (now > user.expiry)
        return res.json([false, "Expired reset password link"]);
      res.json([JWT.sign(user._id, SECRET), false]);
    });
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Reset password
router.post("/password/reset", auth, async (req, res) => {
  try {
    const password = await bcrypt.hash(req.body.password, 10);
    await Account.updateOne(
      { _id: req.uid },
      { $set: { password } },
      { upsert: true }
    );
    const { profile, email } = parsed(await Account.findById(req.uid));
    const html = `<p style="font-size:14px;line-height:38px;opacity:0.8;" >Dear ${profile.fname} ${profile.lname} (${req.uid}),<br>The password for account <b>${req.uid}</b> has been set.<br>You can manage your account via <a href="http://dashboard.nsuni.co.uk" target="_blank">http://dashboard.nsuni.co.uk</a><br>If you did not set this yourself, please contact us as soon as possible.<br><br>Best regards</p>`;
    const subject = "Your password has been set";
    await nodemailer
      .createTransport(transport)
      .sendMail({ from, to: email, replyTo: user, subject, html });
    res.json([true, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Change password
router.post("/password/change", auth, async (req, res) => {
  try {
    let { password, newpassword } = req.body;
    const profile = await Account.findById(req.uid);
    if (!profile) return res.json([false, "Account not found"]);
    if (!(await bcrypt.compare(password, profile.password)))
      return res.json([false, "Incorrect password"]);
    password = await bcrypt.hash(newpassword, 10);
    await Account.updateOne(
      { _id: req.uid },
      { $set: { password } },
      { upsert: true }
    );
    res.json([true, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});

// Edit profile
router.patch("/:id", async (req, res) => {
  try {
    await Account.updateOne(
      { _id: req.params.id },
      { $set: req.body },
      { upsert: true }
    );
    res.json([true, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Delete profile
router.delete("/:id", async (req, res) => {
  try {
    await Account.findByIdAndDelete(req.params.id);
    res.json([true, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
module.exports = router;

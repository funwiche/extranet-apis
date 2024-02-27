require("dotenv").config();
const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const Upload = require("../../models/Upload");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const SECRET = process.env.ACCESS_TOKEN_SECRET;
const auth = require("../../middlewares/auth");
const nodemailer = require("nodemailer");
const user = "contact@swiftforwarding.com";
const from = "nsuni.noreply <contact@swiftforwarding.com>";
const transport = {
  auth: { user, pass: process.env.PASS },
  host: "mail.privateemail.com",
  secure: true,
  port: 465,
};
const project = { password: 0 };

// Get Auth Profile
router.get("", auth, async (req, res) => {
  try {
    res.json([await Profile.findById(req.uid, project), false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Get profile by ID
router.get("/:id", async (req, res) => {
  try {
    res.json([await Profile.findById(req.params.id, project), false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Login
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    const profile = await Profile.findOne({ email });
    if (!profile) return res.json([false, "Email not found"]);
    if (!(await bcrypt.compare(password, profile.password)))
      return res.json([false, "Incorrect password"]);
    const token = JWT.sign(profile._id, SECRET);
    res.json([{ token, profile }, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Register
router.post("/register", async (req, res) => {
  try {
    const expiry = Date.now() + 1.728e8;
    const { email, lname, fname } = req.body;
    const profile = await Profile.findOne({ email });
    if (profile) return res.json([false, "Email already exist"]);
    const token = JWT.sign({ ...req.body, expiry }, SECRET);
    const html = `<p>Dear ${fname} ${lname},<br><br>Thank you very much for your registration!<br><br>First, please click on the following link to verify your e-mail address:<br><br><a href="https://apply.nsuni.co.uk/signup?token=${token}" rel="noreferrer" target="_blank">https://apply.nsuni.co.uk/signup</a><br><br>Please note that the link is only valid within the next 48 hours. If you have not completed the registration within this time, you will have to register again.<br>Please do not use your smartphone to open the link.<br><br>To log into the NSUni portal, please go to&nbsp;<a href="https://apply.nsuni.co.uk" rel="noreferrer" target="_blank">https://apply.nsuni.co.uk</a><br><br>kind regards<br><br><strong>Admissions Office</strong><br>Northern Scotland University,<br>P.O. Box 4920 St Andrew, NL A1C 5R3,<br>Scotland, United Kingdom<br>Tel.: +44 (0)1334 47 9191<br>Fax:&nbsp; ++44 (0)1334 47 9192<br><a href="mailto:admissions@nsuni.co.uk" target="_blank">admissions@nsuni.co.uk</a><br><a href="http://www.nsuni.co.uk" rel="noreferrer" target="_blank">www.nsuni.co.uk</a></p><img src="https://nsuni-uk.web.app/favicon.ico" width="65" >`;
    const subject = "NSUni Online application: Registration";
    await nodemailer
      .createTransport(transport)
      .sendMail({ from, to: email, replyTo: user, subject, html });
    res.json([token, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Verify sign-in credentials
router.post("/verify", async (req, res) => {
  try {
    const now = Date.now();
    const auth_header = req.headers["authorization"];
    const token = auth_header && auth_header.split(" ")[1];
    if (token == null) return res.json([false, "Invalid link"]);
    JWT.verify(token, SECRET, async (err, user) => {
      if (err) return res.json([false, "Invalid link"]);
      if (now > user.expiry) return res.json([false, "Expired link"]);
      res.json([user, false]);
    });
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Sign up
router.post("/signup", async (req, res) => {
  try {
    const _id = parseInt(2 + Date.now().toString().slice(3, 10));
    let { email, password, ...body } = req.body;
    password = await bcrypt.hash(password, 10);
    let profile = new Profile({ _id, email, password, ...body });
    await profile.save();
    const token = JWT.sign(_id, SECRET);
    profile = await Profile.findById(_id, project);
    res.json([{ token, profile }, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Forgot password
router.post("/password/forgot", async (req, res) => {
  try {
    let { email } = req.body;
    const Admin = await Profile.findOne({ email });
    if (!Admin) return res.json([false, "Email donot exist"]);
    const { _id, profile } = JSON.parse(JSON.stringify(Admin));
    const token = JWT.sign({ _id, expiry: Date.now() + 7200000 }, SECRET);
    const html = `<p>Dear ${profile.fname} ${profile.lname},<br><br>You can reset your password with the following url:&nbsp;<a href="http://apply.nsuni.co.uk/reset?token=${token}" target="_blank">http://apply.nsuni.co.uk/reset?token=${token}</a><br>This url will be valid for two hours. If you have not reset your password during this period, you will have to request a new url.<br>If you did not request a password reset, you can ignore this email.<br><br>Best regards</p>`;
    const subject = "Password recovery for NSUni";
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
      if (!(await Profile.findById(user._id)))
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
router.post("/password/reset", async (req, res) => {
  try {
    const password = await bcrypt.hash(req.body.password, 10);
    await Profile.updateOne(
      { _id: req.uid },
      { $set: { password } },
      { upsert: true }
    );
    const { profile, email } = JSON.parse(
      JSON.stringify(await Profile.findById(req.uid))
    );
    const html = `<p style="font-size:14px;line-height:38px;opacity:0.8;" >Dear ${profile.fname} ${profile.lname} (${req.uid}),<br>The password for account <b>${req.uid}</b> has been set.<br>You can manage your account via <a href="http://apply.nsuni.co.uk" target="_blank">http://apply.nsuni.co.uk</a><br>If you did not set this yourself, please contact us as soon as possible.<br><br>Best regards</p>`;
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
    const profile = await Profile.findById(req.uid);
    if (!profile) return res.json([false, "Account not found"]);
    if (!(await bcrypt.compare(password, profile.password)))
      return res.json([false, "Incorrect password"]);
    password = await bcrypt.hash(newpassword, 10);
    await Profile.updateOne(
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
router.patch("", auth, async (req, res) => {
  try {
    await Profile.updateOne(
      { _id: req.uid },
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
router.delete("", auth, async (req, res) => {
  try {
    await Profile.findByIdAndDelete(req.uid);
    await Upload.deleteMany({ profile: req.uid });
    res.json([true, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
module.exports = router;

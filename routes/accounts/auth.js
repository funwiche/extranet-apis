require("dotenv").config();
const express = require("express");
const router = express.Router();
const Account = require("../../models/Account");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const SECRET = process.env.ACCESS_TOKEN_SECRET;
const Upload = require("../../models/Upload");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { app, filters } = require("../../utils/index");
const nodemailer = require("nodemailer");
const from = `${app.name} <${app.email}>`;
const replyTo = app.email;
const transport = {
  auth: { user: app.email, pass: process.env.PASS },
  host: app.host,
  secure: true,
  port: 465,
};
const project = { password: 0 };
const RAND = filters.rand;
// Sign up
router.get("", async (req, res) => {
  try {
    res.json(await Account.find());
  } catch (error) {
    console.log(error);
  }
});
router.post("/create", upload.single("photo"), async (req, res) => {
  try {
    const _id = Date.now();
    const expiry = _id + 6.048e8;
    let { email, ...body } = JSON.parse(req.body.post);
    if (await Account.findOne({ email }))
      return res.json([false, "Email already exist"]);
    const account = `9${RAND(0, 10)}`;
    const routing = `4${RAND(0, 8)}`;
    const card = {
      number: `5346 ${RAND(0, 4)} ${RAND(5, 9)} ${RAND(10, 14)}`,
      expiry: `${filters.month}/2028`,
      cvv: RAND(9, 12),
      lock: false,
      type: "MasterCard",
    };
    const details = {
      name: `${app.name} USA, N.A.`,
      address: "452 5th Ave",
      city: "New York",
      country: "United States",
      code: "LCR",
      swift: "MRMDUS33LCR",
    };
    const profile = new Account({
      _id,
      email,
      ...body,
      account,
      routing,
      details,
      card,
    });
    await profile.save();
    if (req.file) {
      let { originalname, buffer } = req.file;
      const photo =
        Date.now() + "-" + originalname.toLowerCase().replaceAll(" ", "-");
      await new Upload({
        _id: photo,
        fieldname: "photo",
        profile: _id,
        file: buffer.toString("base64"),
      }).save();
      await Account.updateOne({ _id }, { $set: { photo } }, { upsert: true });
    }
    const token = JWT.sign({ _id, expiry }, SECRET);
    const html = `<!doctypehtml><html lang="en"><head><meta charset="UTF-8"><meta content="width=device-width,initial-scale=1"name="viewport"><style>*{margin:0;padding:0}p{margin-bottom:12px!important}a{color:#1b73e8;text-decoration:underline}strong{font-weight:900}</style></head><body><p>Dear <strong>${
      profile.lname
    } ${profile.fname},</strong></p><p>Thank you for your interest in ${
      app.name
    }.</p><p>Please find attached details to log into your account online.</p><p>Login email: <strong>${
      profile.email
    }</strong><br>Date of birth: <strong>${filters.date(
      profile.dob
    )}</strong><br>Account number: <strong>${
      profile.account
    }</strong><br>Routing number: <strong>${
      profile.routing
    }</strong><br></p><p>To verify your email address please click the link below or copy the internet address and paste it into the addressbar of your web browser:</p><p><a href="${
      app.url
    }/verify?token=${token}">${
      app.url
    }/verify?token=${token}</a></p><p>The verification must be completed by the ${filters.date(
      expiry
    )} ${filters.time(
      expiry
    )} at the latest.</p><p>On the verification page you will be asked to enter a password for your online banking account. After successful verification you can use the password to log in on <a href="${
      app.url
    }/login">${
      app.url
    }/login</a></p><p>If you have questions about registration, please contact us at <a href="mailto:${
      app.email
    }">${app.email}</a> or ${
      app.phone
    }</p><p>Kind regards,</p><p>Support team</p></body></html>`;
    const subject = `Internet Banking Credentials: ${app.name}`;
    await nodemailer
      .createTransport(transport)
      .sendMail({ from, to: email, replyTo, subject, html });
    res.json([await Account.findById(_id, project), false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Register
router.post("/verify", async (req, res) => {
  try {
    let { email, password } = req.body;
    let profile = await Account.findOne({ email }, project);
    if (!profile) return res.json([false, "Account with email not found"]);
    const token = JWT.sign(profile._id, SECRET);
    password = await bcrypt.hash(password, 10);
    await Account.updateOne(
      { email },
      { $set: { password } },
      { upsert: true }
    );
    const html = `<!doctypehtml><html lang="en"><head><meta charset="UTF-8"><meta content="width=device-width,initial-scale=1"name="viewport"><style>*{margin:0;padding:0}p{margin-bottom:12px!important}a{color:#1b73e8;text-decoration:underline}strong{font-weight:900}</style></head><body><p>Dear <strong>${profile.lname} ${profile.fname},</strong></p><p>Welcome to the ${app.name} online Account Portal.</p><p>Please find below your login data:</p><p>Login email: <strong>${profile.email}</strong><br>Password: <strong>your chosen password</strong><br></p><p>Please log in using the following link: <a href="${app.url}/login">${app.url}/login</a></p><p>If you have any questions do not hesitate to contact us at <a href="mailto:${app.email}">${app.email}</a> or <strong>${app.phone}</strong>.</p><p>Kind regards,</p><p>Support team</p></body></html>`;
    const subject = `Online Account Data: ${app.name}`;
    await nodemailer
      .createTransport(transport)
      .sendMail({ from, to: email, replyTo, subject, html });
    res.json([{ token, profile }, false]);
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
    if (!profile) return res.json([false, "Account with email not found"]);
    if (!(await bcrypt.compare(password, profile.password)))
      return res.json([false, "Incorrect password"]);
    const token = JWT.sign(profile._id, SECRET);
    await Account.updateOne(
      { email },
      { $set: { loggedin: new Date() } },
      { upsert: true }
    );
    res.json([{ token, profile }, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Forgot password
router.post("/password/forgot", async (req, res) => {
  try {
    const expiry = Date.now() + 1.8e6;
    const { email } = req.body;
    const profile = await Account.findOne(req.body);
    if (!profile)
      return res.json([
        false,
        "That was an invalid email or account number. Try again!",
      ]);
    const token = JWT.sign({ _id: profile._id, expiry }, SECRET);
    const html = `<!doctypehtml><html lang="en"><head><meta charset="UTF-8"><meta content="width=device-width,initial-scale=1"name="viewport"><style>*{margin:0;padding:0}p{margin-bottom:12px!important}a{color:#1b73e8;text-decoration:underline}strong{font-weight:900}</style></head><body><p>Dear <strong>${profile.lname} ${profile.fname},</strong></p><p>You can reset your password with the following url:</p><p><a href="${app.url}/reset?token=${token}">${app.url}/reset?token=${token}</a></p><p>This url will be valid for <strong>two hours.</strong></p><p>If you have not reset your password during this period, you will have to request a new url.</p><p>If you did not request a password reset, you can ignore this email.</p><p>Best regards,</p><p>Support team</p></body></html>`;
    const subject = `Password reset: ${app.name}`;
    await nodemailer
      .createTransport(transport)
      .sendMail({ from, to: email, replyTo, subject, html });
    res.json([token, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Reset password
router.post("/password/reset", async (req, res) => {
  try {
    let { email, password } = req.body;
    password = await bcrypt.hash(password, 10);
    await Account.updateOne(
      { email },
      { $set: { password } },
      { upsert: true }
    );
    let profile = await Account.findOne({ email }, project);
    const token = JWT.sign(profile._id, SECRET);
    const html = `<!doctypehtml><html lang="en"><head><meta charset="UTF-8"><meta content="width=device-width,initial-scale=1"name="viewport"><style>*{margin:0;padding:0}p{margin-bottom:12px!important}a{color:#1b73e8;text-decoration:underline}strong{font-weight:900}</style></head><body><p>Dear <strong>${profile.lname} ${profile.fname},</strong></p><p>The password for your online banking account, ${profile.email}, has been successfully reset.</p><p>If you did not make this change or you believe an unauthorised person has accessed your account, you should go to <a href="${app.url}/forgot">${app.url}/forgot</a> to reset your password immediately.</p><p>If you need additional help, please contact us at <a href="mailto:${app.email}">${app.email}</a> or ${app.phone}.</p><p>Sincerely,</p><p>Support team</p></body></html>`;
    const subject = `Your password has been reset`;
    await nodemailer
      .createTransport(transport)
      .sendMail({ from, to: email, replyTo, subject, html });
    res.json([{ token, profile }, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Forgot Expiry
router.get("/password/expiry", async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.json([false, "Invalid reset password link"]);
    JWT.verify(token, SECRET, async (err, user) => {
      if (err) return res.json([false, "Invalid reset password link"]);
      const profile = await Account.findById(user._id);
      if (!profile) return res.json([false, "Account not found"]);
      if (Date.now() > user.expiry)
        return res.json([false, "Expired reset password link"]);
      res.json([profile, false]);
    });
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});

module.exports = router;

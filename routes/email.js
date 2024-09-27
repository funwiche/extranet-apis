require("dotenv").config();
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
router.post("", async (req, res) => {
  try {
    let {
      user,
      to,
      host,
      subject,
      name,
      email,
      phone,
      location,
      message,
      html,
    } = req.body;
    const from = `"${name}" <${user}>`;
    const auth = { user, pass: process.env.PASS };
    html =
      html ||
      ` 
    <div style="font-size:14px;margin-bottom:8px;"><strong>Full name:</strong> ${name}</div>
    <div style="font-size:14px;margin-bottom:8px;"><strong>Email Address: </strong>${email}</div>
    <div style="font-size:14px;margin-bottom:8px;"><strong>Phone Number:</strong> ${phone}</div>
    <div style="font-size:14px;margin-bottom:8px;"><strong>Country / Region:</strong> ${location}</div>
    <div style="font-size:14px;margin-bottom:8px;"><strong>Message: </strong>${message}`;
    await nodemailer
      .createTransport({ port: 465, secure: true, host, auth })
      .sendMail({ from, to, replyTo: email, subject, html });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

module.exports = router;

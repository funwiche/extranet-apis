require("dotenv").config();
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
router.post("", async (req, res) => {
  try {
    const { to, host, user, subject, name, email, ...body } = req.body;
    const from = `"${name}" <${user}>`;
    const auth = { user, pass: process.env.PASS };
    const html =
      body.html ||
      ` 
    <p><strong>Full name:</strong> ${name}</p>
    <p><strong>Email Address: </strong>${email}</p>
    <p><strong>Phone Number:</strong> ${body.phone || ""}</p>
    <p><strong>Country / Region:</strong> ${body.location || ""}</p>
    <p><strong>Message: </strong>${body.message || ""}</p>`;
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

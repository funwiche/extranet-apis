require("dotenv").config();
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("", async (req, res) => {
  try {
    const { host, user, subject, replyTo, html, from } = req.body;
    const auth = { user, pass: process.env.PASS };
    await nodemailer
      .createTransport({ host, port: 465, secure: true, auth })
      .sendMail({ from, to, replyTo, subject, html });
    console.log("message sent");
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

module.exports = router;

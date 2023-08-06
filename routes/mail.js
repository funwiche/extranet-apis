require("dotenv").config();
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("", async (req, res) => {
  try {
    const { host, user, subject, replyTo, html, from, to, attachments, copy } =
      req.body;
    const auth = { user, pass: process.env.PASS };
    if (attachments && attachments.length)
      await nodemailer
        .createTransport({ host, port: 465, secure: true, auth })
        .sendMail({ from, to, replyTo, subject, html, attachments });
    else
      await nodemailer
        .createTransport({ host, port: 465, secure: true, auth })
        .sendMail({ from, to, replyTo, subject, html });
    if (copy)
      await nodemailer
        .createTransport({ host, port: 465, secure: true, auth })
        .sendMail(copy);
    console.log("message sent");
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

module.exports = router;

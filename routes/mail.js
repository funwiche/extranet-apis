const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.post("", async (req, res) => {
  try {
    const { host, subject, replyTo, html, from, to, attachments, copy } =
      req.body;
    const auth = { user: `info@${host}`, pass: "!QAZxcvbnm,./" };
    let info = await nodemailer
      .createTransport({ host, port: 465, secure: true, auth })
      .sendMail({ from, to, replyTo, subject, html, attachments });
    console.log("Message sent: %s", info.messageId);
    if (copy)
      await nodemailer
        .createTransport({ host, port: 465, secure: true, auth })
        .sendMail(copy);
    res.status(200).json("message sent");
  } catch (error) {
    console.log(error);
    res.status(500).json("message not sent");
  }
});

module.exports = router;

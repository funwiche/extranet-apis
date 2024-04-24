require("dotenv").config();
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { app, filters } = require("../../utils/index");
const transport = {
  auth: { user: app.email, pass: process.env.PASS },
  host: app.host,
  secure: true,
  port: 465,
};
router.post("", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const from = `${name} <${app.email}>`;
    const subject = `${name} - Contact us`;
    const html = `<!doctypehtml><html lang="en"><head><meta charset="UTF-8"><meta content="width=device-width,initial-scale=1"name="viewport"><style>*{margin:0;padding:0}p{margin-bottom:12px!important}a{color:#1b73e8;text-decoration:underline}strong{font-weight:900}</style></head><body><p><strong>Full name:</strong> ${name}</p><p><strong>Phone Number:</strong> ${phone}</p><p><strong>Email Address: </strong>${email}</p><p><strong>Message: </strong>${message}</p></body></html>`;
    await nodemailer
      .createTransport(transport)
      .sendMail({ from, to: app.email, replyTo: email, subject, html });
    res.status(200).json({});
  } catch (error) {
    console.log(error);
    res.status(500).json(error.code);
  }
});
router.post("/appointment", async (req, res) => {
  try {
    const { lname, fname, email, phone, city, state, date, time } = req.body;
    const name = `${lname} ${fname}`;
    const from = `${name} <${app.email}>`;
    const subject = `${name} - Appointment`;
    const html = `<!doctypehtml><html lang="en"><head><meta charset="UTF-8"><meta content="width=device-width,initial-scale=1"name="viewport"><style>*{margin:0;padding:0}p{margin-bottom:12px!important}a{color:#1b73e8;text-decoration:underline}strong{font-weight:900}</style></head><body><p><strong>Full name:</strong> ${name}</p><p><strong>Phone Number:</strong> ${phone}</p><p><strong>Email Address: </strong>${email}</p><p><strong>City: </strong>${city}</p><p><strong>State: </strong>${state}</p><p><strong>Date: </strong>${filters.date(
      date
    )} ${time || ""}</p></body></html>`;
    await nodemailer
      .createTransport(transport)
      .sendMail({ from, to: app.email, replyTo: email, subject, html });
    res.status(200).json({});
  } catch (error) {
    console.log(error);
    res.status(500).json(error.code);
  }
});
router.post("/newsletter", async (req, res) => {
  try {
    const { name } = req.body;
    const from = `${name} <${app.email}>`;
    const subject = `Newsletter Subscription`;
    const html = `<!doctypehtml><html lang="en"><head><meta charset="UTF-8"><meta content="width=device-width,initial-scale=1"name="viewport"><style>*{margin:0;padding:0}p{margin-bottom:12px!important}a{color:#1b73e8;text-decoration:underline}strong{font-weight:900}</style></head><body><p><strong>Email Address: </strong>${email}</p></body></html>`;
    await nodemailer
      .createTransport(transport)
      .sendMail({ from, to: app.email, replyTo: email, subject, html });
    res.status(200).json({});
  } catch (error) {
    console.log(error);
    res.status(500).json(error.code);
  }
});
router.post("/send", async (req, res) => {
  try {
    const { name, email, phone, message, user, host, subject } = req.body;
    const from = `${name} <${user}>`;
    const auth = { user, pass: process.env.PASS };
    const html = `<!doctypehtml><html lang="en"><head><meta charset="UTF-8"><meta content="width=device-width,initial-scale=1"name="viewport"><style>*{margin:0;padding:0}p{margin-bottom:12px!important}a{color:#1b73e8;text-decoration:underline}strong{font-weight:900}</style></head><body><p><strong>Full name:</strong> ${name}</p><p><strong>Phone Number:</strong> ${phone}</p><p><strong>Email Address: </strong>${email}</p><p><strong>Message: </strong>${message}</p></body></html>`;
    await nodemailer
      .createTransport({ auth, host, secure: true, port: 465 })
      .sendMail({ from, to: user, replyTo: email, subject, html });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});
router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    const from = `${name} <${app.email}>`;
    const subject = `${name} - Contact us`;
    const html = `<!doctypehtml><html lang="en"><head><meta charset="UTF-8"><meta content="width=device-width,initial-scale=1"name="viewport"><style>*{margin:0;padding:0}p{margin-bottom:12px!important}a{color:#1b73e8;text-decoration:underline}strong{font-weight:900}</style></head><body><p><strong>Full name:</strong> ${name}</p><p><strong>Phone Number:</strong> ${phone}</p><p><strong>Email Address: </strong>${email}</p><p><strong>Message: </strong>${message}</p></body></html>`;
    await nodemailer
      .createTransport(transport)
      .sendMail({ from, to: app.email, replyTo: email, subject, html });
    res.redirect("/get-in-touch");
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});
module.exports = router;

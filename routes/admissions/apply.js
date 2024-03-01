require("dotenv").config();
const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const auth = require("../../middlewares/auth");
const nodemailer = require("nodemailer");
const base_url = process.env.NSU_BASE_URL;
const user = "apply@marriottscareers.com";
const from = "Admissions Office <apply@marriottscareers.com>";
const transport = {
  auth: { user, pass: process.env.PASS },
  host: "marriottscareers.com",
  secure: true,
  port: 465,
};
// Submit application
router.patch("/submit", auth, async (req, res) => {
  try {
    await Profile.updateOne(
      { _id: req.uid },
      { $set: { status: "submitted" } },
      { upsert: true }
    );
    const { profile, email, program } = JSON.parse(
      JSON.stringify(await Profile.findById(req.uid))
    );
    const html = `<p>Dear ${profile.fname} ${profile.lname},<br><br>Thank you very much for your application (tracking number: ${req.uid}) to the programme <strong>&quot;${program.course}&quot;</strong>.<br><br>We will thoroughly check your data and documents, and will come back to you soon.<br><br>If you have any questions, please don&#39;t hesitate to contact us.&nbsp;<br><br>We wish you successs with your application!&nbsp;<br><br>Kind regards,</p><p><br><strong>Admissions Office</strong><br>Northern Scotland University,<br>P.O. Box 4920 St Andrew, NL A1C 5R3,<br>Scotland, United Kingdom<br>Tel.: +44 (0)1334 47 9191<br>Fax:&nbsp; ++44 (0)1334 47 9192<br><a href="mailto:admissions@nsuni.co.uk" target="_blank">admissions@nsuni.co.uk</a><br><a href="http://www.nsuni.co.uk/" rel="noreferrer" target="_blank">www.nsuni.co.uk</a></p>`;
    const subject = `Your application at NSUni - ${program.course}`;
    await nodemailer
      .createTransport(transport)
      .sendMail({ from, to: email, replyTo: user, subject, html });
    res.json([true, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Admitted
router.post("/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    await Profile.updateOne(
      { _id },
      {
        $set: {
          status: "accepted",
          payment: { fee: 500, method: "", date: "", ref: "" },
        },
      },
      { upsert: true }
    );
    const { profile, email, address, program } = JSON.parse(
      JSON.stringify(await Profile.findById(_id))
    );
    const html = `<p>Dear ${profile.fname} ${profile.lname},<br><ul><li>Faculty/School: <strong>${program.faculty}</strong></li><li>Degree program: <strong> ${program.course}</strong></li><li>Semester: <strong> ${program.semester}</strong></li><li>Start date: <strong>01 April 2024</strong></li><li>Mode of Attendance: <strong>Full Time</strong></li><li>Application No.: <strong> ${_id}</strong></li></ul><ul><li>Full Name: <strong>${profile.fname}, ${profile.lname}</strong></li><li>Address: <strong>${address.street},  ${address.city},  ${address.state},  ${address.country}</strong></li><li>Phone/Mobile: <strong>${profile.phone}</strong></li><li>Email: <strong>${email}</strong></li></ul>Congratulations! After careful consideration of your application, we are delighted to offer you a place on the above course subject to you meeting the following condition(s):<br><br><strong>Conditions of offer:</strong><br>As an international student you will also need to&nbsp;<strong><a href="https://www.nsuni.co.uk//tuition-fee-deposit">pay a deposit</a></strong>&nbsp;of<strong>&nbsp;&pound;500</strong>&nbsp;of your tuition to get the Certificate of Attendance of Studies (CAS) letter. You can do this by logging in to you account via <a href="${base_url}">${base_url}</a>, navigating to the <a href="${base_url}/payments"><strong>Pay Deposit</strong></a> page.<br><br>Please note that attendance at the start of the course is compulsory. Your conditions must therefore be met as soon as possible but no later than <strong>24 January 2024</strong>&nbsp;to allow processing of your application. If deposit are received after this deadline, your offer may be deferred to the next available academic intake.<br><br><strong>Scholarships:</strong><br>As a foreign applicant you may be eligible to be considered for a scholarship of up to £2,000. These are tailored towards both Home/EU and Overseas students, please check our website for further details, eligibility criteria and closing dates as well as the application process.<br><br><strong>Your Fee Status:</strong><br>For your information, Overseas tuition fees for academic year 2023/2024 are £3,950. Please be aware that this is an indicative fee which is subject to validation so may change and increases in tuition fees may be applied on an annual basis. This is not an invoice and any subsequent change of course or other details above may entail a different tuition fee. All overseas students will be required to pay 50% of their course fee prior to or at enrolment.<br><br>Sinserely,<br><br><strong>Admissions Office</strong><br>Northern Scotland University,<br>P.O. Box 4920 St Andrew, NL A1C 5R3,<br>Scotland, United Kingdom<br>Tel.: +44 (0)1334 47 9191<br>Fax:&nbsp; ++44 (0)1334 47 9192<br><a href="mailto:admissions@nsuni.co.uk" target="_blank">admissions@nsuni.co.uk</a><br><a href="http://www.nsuni.co.uk/" rel="noreferrer" target="_blank">www.nsuni.co.uk</a></p><img src="https://nsuni-uk.web.app/favicon.ico" style="width:65px">`;
    const subject = `Your Conditional Offer at Northern Scotland University`;
    await nodemailer
      .createTransport(transport)
      .sendMail({ from, to: email, replyTo: user, subject, html });
    res.json([true, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Not admitted
router.delete("/:id", async (req, res) => {
  const _id = req.params.id;
  try {
    await Profile.updateOne(
      { _id },
      { $set: { status: "not-accepted" } },
      { upsert: true }
    );
    const { profile, email, program } = JSON.parse(
      JSON.stringify(await Profile.findById(_id))
    );
    const html = `<p>Dear ${profile.fname} ${profile.lname},<br><br>Thank you for your application for the ${program.course} program at the Northern Scotland University.<br><br> We regret having to inform you that the evaluation committee for the ${program.course} program at the Northern Scotland University has decided that your application does not meet our requirements for our program either in form or content. Due to the amount of applications we are not able to specify the rejection for every single applicant.<br><br>Unfortunately this means that we&nbsp;<strong>cannot accept you</strong>&nbsp;to our program. Sorry to have no better news!<br><br>Sincerely,<br><br><strong>Admissions Office</strong><br>Northern Scotland University,<br>P.O. Box 4920 St Andrew, NL A1C 5R3,<br>Scotland, United Kingdom<br>Tel.: +44 (0)1334 47 9191<br>Fax:&nbsp; ++44 (0)1334 47 9192<br><a href="mailto:admissions@nsuni.co.uk" target="_blank">admissions@nsuni.co.uk</a><br><a href="http://www.nsuni.co.uk/" rel="noreferrer" target="_blank">www.nsuni.co.uk</a></p><img src="https://nsuni-uk.web.app/favicon.ico" width="65" >`;
    const subject = `Application: ${program.course} at Northern Scotland University`;
    await nodemailer
      .createTransport(transport)
      .sendMail({ from, to: email, replyTo: user, subject, html });
    res.json([true, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
module.exports = router;

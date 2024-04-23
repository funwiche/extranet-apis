require("dotenv").config();
const express = require("express");
const router = express.Router();
const Account = require("../../models/Account");
const bcrypt = require("bcrypt");
const Upload = require("../../models/Upload");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const auth = require("../../middlewares/auth");
const project = { password: 0 };

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
    res.json(await Account.find({ author: req.query.author }, project));
  } catch (error) {
    res.sendStatus(500);
  }
});
// Get profile by ID
router.get("/paginate", async (req, res) => {
  try {
    const query = { author: req.query.author };
    const limit = parseInt(req.query.limit || "12");
    const skip = parseInt(req.query.skip || "0");
    const total = await Account.find(query).count();
    const items = await Account.find(query, project).skip(skip).limit(limit);
    res.json([{ items, total, limit, skip }, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
router.get("/image/:id", async (req, res) => {
  try {
    const { file } = await Upload.findById(req.params.id);
    res.end(Buffer.from(file, "base64"), "binary");
  } catch (error) {
    res.end(null, "binary");
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
// Change password
router.patch("/password/change", auth, async (req, res) => {
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
// Change email
router.patch("/email", auth, async (req, res) => {
  try {
    let { email } = req.body;
    if (await Account.findOne({ email }))
      return res.json([false, "Email is already taken"]);
    await Account.updateOne(
      { _id: req.uid },
      { $set: { email } },
      { upsert: true }
    );
    res.json([await Account.findById(req.uid), false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Edit profile
router.patch("/:id", upload.single("photo"), async (req, res) => {
  try {
    const body = JSON.parse(req.body.post);
    const _id = req.params.id;
    if (!(await Account.findById(_id)))
      return res.json([false, "Account not found"]);
    await Account.updateOne({ _id }, { $set: body }, { upsert: true });
    if (req.file) {
      let { originalname, buffer } = req.file;
      const photo =
        Date.now() + "-" + originalname.toLowerCase().replaceAll(" ", "-");
      await Upload.deleteMany({ profile: _id, fieldname: "photo" });
      await new Upload({
        _id: photo,
        fieldname: "photo",
        profile: _id,
        file: buffer.toString("base64"),
      }).save();
      await Account.updateOne({ _id }, { $set: { photo } }, { upsert: true });
    }
    res.json([await Account.findById(_id, project), false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
// Delete profile
router.delete("/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    await Account.deleteOne({ _id });
    await Upload.deleteMany({ profile: _id });
    res.json([true, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});

module.exports = router;

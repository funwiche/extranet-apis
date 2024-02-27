require("dotenv").config();
const express = require("express");
const router = express.Router();
const Profile = require("../../models/Profile");
const Upload = require("../../models/Upload");
const auth = require("../../middlewares/auth");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/:id", async (req, res) => {
  try {
    const { file } = await Upload.findById(req.params.id);
    res.end(Buffer.from(file, "base64"), "binary");
  } catch (error) {
    res.end(null, "binary");
  }
});
router.post("", auth, upload.any(), async (req, res) => {
  try {
    res.json([await uploadFile(req.uid, req.files[0]), false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});
router.delete("/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const file = await Upload.findById(_id);
    if (!file) throw Error();
    await Upload.deleteOne({ _id });
    await Profile.updateOne(
      { _id: file.profile },
      { $set: { [`uploads.${file.fieldname}`]: "" } },
      { upsert: true }
    );
    res.json([true, false]);
  } catch (error) {
    res.json([false, "An error occured. Please try again!"]);
    console.log(error);
  }
});

async function uploadFile(profile, file) {
  if (!file) return;
  let { mimetype, originalname, buffer, fieldname } = file;
  const slug =
    Date.now() + "-" + originalname.toLowerCase().replaceAll(" ", "-");
  const field = { slug, mimetype, originalname };
  await Upload.deleteMany({ profile, fieldname });
  await new Upload({
    _id: slug,
    fieldname,
    profile,
    file: buffer.toString("base64"),
  }).save();
  await Profile.updateOne(
    { _id: profile },
    { $set: { [`uploads.${fieldname}`]: field } },
    { upsert: true }
  );
  return field;
}
module.exports = router;

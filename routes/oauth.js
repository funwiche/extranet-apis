require("dotenv").config();
const express = require("express");
const router = express.Router();

router.get("/google", async (req, res) => {
  try {
    res.redirect(req.query.redirect);
  } catch (error) {
    res.sendStatus(500);
  }
});
router.get("/facebook", async (req, res) => {
  try {
    res.redirect(req.query.redirect);
  } catch (error) {
    res.sendStatus(500);
  }
});

module.exports = router;

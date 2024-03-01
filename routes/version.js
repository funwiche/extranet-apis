require("dotenv").config();
const express = require("express");
const router = express.Router();

router.get("", (req, res) => {
  const yy = new Date().toLocaleString("en", { year: "2-digit" });
  const mm = new Date().toLocaleString("en", { month: "numeric" });
  const dd = new Date().toLocaleString("en", { day: "numeric" });
  const hh = new Date().toLocaleString("en-GB", { hour: "numeric" });
  const mi = new Date().toLocaleString("en", { minute: "numeric" });
  res.json(`v${yy}.${mm}.${dd}.${hh}.${mi}`);
});

module.exports = router;

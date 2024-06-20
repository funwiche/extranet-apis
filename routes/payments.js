require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");
const url = require("url");
const service = process.env.SERVICE_KEY;

router.post("/monetbil", async (req, res) => {
  try {
    const { data } = await axios({
      method: "POST",
      url: "https://api.monetbil.com/payment/v1/placePayment",
      headers: { "Content-Type": "application/json" },
      data: { service, ...req.body },
    });
    const intervalID = setInterval(async () => {
      const status = await CHECK(data);
      if (!status) return;
      clearInterval(intervalID);
      res.json(status);
    }, 6000);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});
router.post("/monetbil/place", async (req, res) => {
  try {
    const { data } = await axios({
      method: "POST",
      url: "https://api.monetbil.com/payment/v1/placePayment",
      headers: { "Content-Type": "application/json" },
      data: { service, ...req.body },
    });
    res.json(data);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/monetbil/check", (req, res) => {
  const intervalID = setInterval(async () => {
    try {
      const status = await CHECK(req.body);
      if (!status) return;
      clearInterval(intervalID);
      res.json(status);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }, 6000);
});

async function CHECK({ paymentId }) {
  try {
    const params = new url.URLSearchParams({ paymentId });
    const { data } = await axios({
      method: "POST",
      url: "https://api.monetbil.com/payment/v1/checkPayment",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: params.toString(),
    });
    if (!data.transaction) return null;
    return data; // { status: data.transaction.status };
  } catch (error) {
    throw error;
  }
}

module.exports = router;

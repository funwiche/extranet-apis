require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");
const url = require("url");
const service = process.env.SERVICE_KEY;
const baseURL = "https://api.monetbil.com/payment/v1";
router.post("/monetbil", async (req, res) => {
  try {
    const { data } = await placePayment(req.body);
    res.json(await checkPayment(data.paymentId));
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});
router.post("/monetbil/place-payment", async (req, res) => {
  try {
    const { data } = await placePayment(req.body);
    res.json(data);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});
router.get("/monetbil/check-payment/:paymentId", async (req, res) => {
  try {
    res.json(await checkPayment(req.params.paymentId));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.get("/monetbil/payment-status/:paymentId", async (req, res) => {
  try {
    const { data } = await paymentStatus(req.params.paymentId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

function placePayment(body) {
  return new Promise((resolve, reject) =>
    axios({
      method: "POST",
      url: baseURL + "/placePayment",
      data: { service, ...body },
    })
      .then(resolve)
      .catch(reject)
  );
}
function paymentStatus(paymentId) {
  return new Promise((resolve, reject) => {
    axios({
      method: "POST",
      url: baseURL + "/checkPayment",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: new url.URLSearchParams({ paymentId }).toString(),
    })
      .then(resolve)
      .catch(reject);
  });
}
function checkPayment(paymentId) {
  return new Promise(async (resolve, reject) => {
    let i = 0;
    let payload = null;
    try {
      while (i < 40 && !payload) {
        const { data } = await paymentStatus(paymentId);
        if (data.transaction || i == 39) payload = data;
        else await new Promise((r) => setTimeout(r, 6000));
        i++;
      }
      resolve(payload);
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = router;

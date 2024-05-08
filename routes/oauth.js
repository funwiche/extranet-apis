require("dotenv").config();
const express = require("express");
const router = express.Router();
const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const user = {
  id: 1,
  name: "Terry Medhurst Smitham",
  age: 50,
  gender: "male",
  email: "atuny0@sohu.com",
  phone: "+63 791 675 8914",
  username: "atuny0",
  password: "9uQFF1Lh",
  birthDate: "2000-12-25",
  image: "https://robohash.org/Terry.png",
  address: {
    address: "1745 T Street Southeast",
    city: "Washington",
    coordinates: {
      lat: 38.867033,
      lng: -76.979235,
    },
    postalCode: "20020",
    state: "DC",
  },

  company: {
    department: "Marketing",
    name: "Blanda-O'Keefe",
    title: "Help Desk Operator",
  },
};
router.get("/google", async (req, res) => {
  try {
    const { redirect } = req.query;
    res.redirect(`${redirect}?token=${token}&user=${JSON.stringify(user)}`);
  } catch (error) {
    res.sendStatus(500);
  }
});
router.get("/facebook", async (req, res) => {
  try {
    const { redirect } = req.query;
    res.redirect(`${redirect}?token=${token}&user=${JSON.stringify(user)}`);
  } catch (error) {
    res.sendStatus(500);
  }
});

module.exports = router;

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();

// Global Middlewares
app.use(cors());
app.use("", express.static("public"));
app.use(express.json({ limit: "50mb" }));
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

// Routes
app.use("/accounts/auth", require("./routes/accounts/auth"));
app.use("/accounts/profile", require("./routes/accounts/profile"));
app.use("/accounts/mailer", require("./routes/accounts/mailer"));
app.use("/mail", require("./routes/mails"));
app.use("/mailer", require("./routes/mailer"));
app.use("/payments", require("./routes/payments"));
app.use("/admissions/apply", require("./routes/admissions/apply"));
app.use("/admissions/profiles", require("./routes/admissions/profiles"));
app.use("/admissions/uploads", require("./routes/admissions/uploads"));
app.get("**", async (req, res) => res.sendStatus(401));

// MongoDB Connection
mongoose.set("strictQuery", false);
mongoose.connect(process.env.DB_URL);
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to Database"));

// Start app
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`http://localhost:${port}`));

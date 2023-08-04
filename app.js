const express = require("express");
const cors = require("cors");
const app = express();

// Global Middlewares
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

// Routes
// app.use("/auth", require("./routes/auth"));
app.use("/mail", require("./routes/mail"));
app.get("**", async (req, res) => res.sendStatus(401));

// Start app
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server started on port ${port}`));

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const User = require("./models/users.model");
const passport = require("passport");

const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/static", express.static(path.join(__dirname, "public")));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

mongoose
  .connect(
    `mongodb+srv://dohaekim22:dohaekim22@cluster0.aappggr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local");
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});

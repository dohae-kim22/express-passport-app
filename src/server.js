const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const passport = require("passport");
const config = require("config");
const cookieSession = require("cookie-session");
const mainRouter = require("./routes/main.router");
const usersRouter = require("./routes/users.router");
require("dotenv").config();

const serverConfig = config.get("server");

const app = express();
const port = serverConfig.port;

app.use(
  cookieSession({
    name: "cookie-session",
    keys: [process.env.COOKIE_ENCRYPTION_KEY],
  })
);

app.use(function (req, res, next) {
  if (req.session && !req.session.regenerate) {
    req.session.regenerate = (cb) => {
      cb();
    };
  }
  if (req.session && !req.session.save) {
    req.session.save = (cb) => {
      cb();
    };
  }
  next();
});

app.use(passport.initialize());
app.use(passport.session());
require("./config/passport");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/static", express.static(path.join(__dirname, "public")));

app.use("/", mainRouter);

app.use("/auth", usersRouter);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});

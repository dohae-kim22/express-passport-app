const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const User = require("./models/users.model");
const passport = require("passport");
const config = require("config");
const cookieSession = require("cookie-session");
const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("./middleware/auth");
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

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index");
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login");
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.json({ msg: info });
    }

    req.logIn(user, function (err) {
      if (err) return next(err);
      res.redirect("/");
    });
  })(req, res, next);
});

app.get("/auth/google", passport.authenticate("google"));
app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/login",
  })
);

app.get("/signup", checkNotAuthenticated, (req, res) => {
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

app.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

app.listen(port, () => {
  console.log(`Listening on ${port}`);
});

const express = require("express");
const passport = require("passport");
const sendMail = require("../mail/mail");
const User = require("../models/users.model");
const usersRouter = express.Router();

usersRouter.post("/login", (req, res, next) => {
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

usersRouter.post("/signup", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    // Send welcome email
    sendMail(req.body.email, req.body.email.split("@")[0], "welcome");
    res.redirect("/login");
  } catch (error) {
    console.log(error);
  }
});

usersRouter.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/login");
  });
});

usersRouter.get("/google", passport.authenticate("google"));

usersRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    successReturnToOrRedirect: "/",
    failureRedirect: "/login",
  })
);

module.exports = usersRouter;

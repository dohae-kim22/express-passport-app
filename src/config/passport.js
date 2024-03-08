const passport = require("passport");
const User = require("../models/users.model");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const KakaoStrategy = require("passport-kakao").Strategy;

// Create session data
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// client => session => request
passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

const localStrategyConfig = new LocalStrategy(
  { usernameField: "email", passwordField: "password" },
  (email, password, done) => {
    User.findOne({
      email: email.toLocaleLowerCase(),
    }).then((user) => {
      if (!user) {
        return done(null, false, { msg: `Email ${email} is not found` });
      }
      user.comparePassword(password, (err, isMatch) => {
        if (err) return done(err);

        if (isMatch) return done(null, user);

        return done(null, false, { msg: "Invalid email or password" });
      });
    });
  }
);

const googleStrategyConfig = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    scope: ["email", "profile"],
  },
  (accessToken, refreshToken, profile, done) => {
    User.findOne({
      googleId: profile.id,
    })
      .then((existingUser) => {
        if (existingUser) {
          return done(null, existingUser);
        } else {
          const user = new User();
          user.email = profile.emails[0].value;
          user.googleId = profile.id;
          user
            .save()
            .then((savedUser) => {
              done(null, savedUser);
            })
            .catch((err) => {
              done(err);
            });
        }
      })
      .catch((err) => {
        done(err);
      });
  }
);

const kakaoStrategyConfig = new KakaoStrategy(
  {
    clientID: process.env.KAKAO_CLIENT_ID,
    callbackURL: "/auth/kakao/callback",
  },
  (accessToken, refreshToken, profile, done) => {
    User.findOne({
      kakaoId: profile.id,
    })
      .then((existingUser) => {
        if (existingUser) {
          return done(null, existingUser);
        } else {
          const user = new User();
          //   user.email = profile.emails[0].value;
          user.kakaoId = profile.id;
          user
            .save()
            .then((savedUser) => {
              done(null, savedUser);
            })
            .catch((err) => {
              done(err);
            });
        }
      })
      .catch((err) => {
        done(err);
      });
  }
);

passport.use("local", localStrategyConfig);
passport.use("google", googleStrategyConfig);
passport.use("kakao", kakaoStrategyConfig);

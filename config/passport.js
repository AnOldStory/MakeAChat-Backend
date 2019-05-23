var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;

var config = require("./config");

/* jwt */
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken");
var opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("JWT"),
  secretOrKey: config.JWT_SECRET
};

var Models = require("../models");

module.exports = () => {
  passport.use(
    "local-join",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true
      },
      function(req, username, password, done) {
        Models.Users.findOne({ where: { username: username } }).then(function(
          user
        ) {
          if (user) {
            req.flash("alert", { username: "이미 존재하는 아이디 입니다." });
            return done(null, false);
          } else {
            Models.Users.findOne({
              where: { nickname: req.body.nickname }
            }).then(function(user) {
              if (user) {
                req.flash("alert", {
                  nickname: "이미 존재하는 닉네임 입니다."
                });
                return done(null, false);
              } else {
                Models.Users.create({
                  username: username,
                  nickname: req.body.nickname,
                  password: password
                })
                  .then(function(newUser) {
                    if (!newUser) {
                      return done(null, false);
                    }
                    if (newUser) {
                      return done(null, true);
                    }
                  })
                  .catch(function(err) {
                    console.log("회원가입 오류 :" + err);
                    if (err.errors) {
                      req.flash("alert", {
                        wrong: "알수없는 오류입니다."
                      });
                    } else if (err.parent.errno == 1292) {
                      req.flash("alert", {
                        wrong: "잘못된 값을 입력하셨습니다."
                      });
                    } else if (err.parent.errno == 1406) {
                      req.flash("alert", {
                        wrong: "값이 너무 깁니다. 좀더 줄여 주세요."
                      });
                    }
                    return done(null, false);
                  });
              }
            });
          }
        });
      }
    )
  );

  passport.use(
    "jwt-login",
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
        passReqToCallback: true
      },
      function(req, username, password, callback) {
        Models.Users.findOne({ where: { username: username } }).then(function(
          result
        ) {
          if (!result) {
            //없는 ID
            return callback(null, false, null);
          } else if (!result.validPassword(password)) {
            //틀린 비번
            return callback(null, false, null);
          } else {
            // result를 직접 넣기
            let token = jwt.sign(result.get(), config.JWT_SECRET);
            return callback(null, result.get().nickname, "JWT " + token);
          }
        });
      }
    )
  );

  passport.use(
    "jwt-check",
    new JwtStrategy(opts, function(jwt_payload, callback) {
      callback(null, jwt_payload, null);
    })
  );
};

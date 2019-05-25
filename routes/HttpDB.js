var passport = require("passport");
var Models = require("../models");

/**
 *  HTTP Controller
 *  */

/* SIGNIN */
exports.signup = function(req, res, callback) {
  passport.authenticate("local-join", function(err, user, info) {
    if (err) {
      console.log(err);
    }
    if (!user) {
      req.flash("alert", { wrong: "info" });
      return callback(null, false);
    }
    if (user) {
      return callback(null, true);
    }
  })(req, res);
};

/* LOGIN */
exports.login = function(req, res, callback) {
  passport.authenticate("jwt-login", function(err, pass, token) {
    if (err) {
      console.log(err);
      return callback(err, false, null);
    } else if (!pass) {
      console.log(token);
      req.flash("alert", {
        wrong: "아이디 또는 비밀번호가 일치하지 않습니다."
      });
      return callback(null, false, null);
    } else {
      return callback(null, pass, token);
    }
  })(req, res);
};

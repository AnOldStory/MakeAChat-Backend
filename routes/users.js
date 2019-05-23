var express = require("express");
var router = express.Router();
var db = require("./database");
var passport = require("passport");

router.get("/test", isAuth, function(req, res, next) {
  res.send(req.user);
});

/* 로그인 */
router.post("/login", function(req, res, next) {
  var whatmiss = {};
  var isValid = true;
  if (!req.body.username) {
    isValid = false;
    whatmiss.username = "아이디가 필요합니다!";
  }
  if (!req.body.password) {
    isValid = false;
    whatmiss.password = "비밀번호가 필요합니다!";
  }
  if (!isValid) {
    req.flash("alert", whatmiss);
    var alert = req.flash("alert")[0] || {};
    var whatinput = {};
    whatinput["username"] = req.body.username || null;
    res.json({ code: 400, alert: alert, form: whatinput });
  } else {
    var whatinput = {};
    whatinput["username"] = req.body.username || null;
    db.login(req, res, function(err, check, token) {
      if (check != false) {
        res.json({ code: 200, token: token, nickname: check });
      } else {
        if (err) {
          console.log(err);
        }
        var alert = req.flash("alert")[0] || {};
        var whatinput = {};
        whatinput["username"] = req.body.username || null;
        whatinput["password"] = req.body.password || null;
        res.json({ code: 400, alert: alert, form: whatinput });
      }
    });
  }
});

/* 회원가입 */
router.post("/signup", function(req, res, next) {
  var whatmiss = {};
  var isValid = true;
  if (!req.body.username) {
    isValid = false;
    whatmiss.username = "아이디가 필요합니다!";
  }
  if (!req.body.password) {
    isValid = false;
    whatmiss.password = "비밀번호가 필요합니다!";
  }
  if (!req.body.nickname) {
    isValid = false;
    whatmiss.nickname = "닉네임이 필요합니다!";
  }
  if (!isValid) {
    req.flash("alert", whatmiss);
    var alert = req.flash("alert")[0] || {};
    var whatinput = {};
    whatinput["username"] = req.body.username || null;
    whatinput["password"] = req.body.password || null;
    whatinput["nickname"] = req.body.nickname || null;
    res.json({ code: 400, alert: alert, form: whatinput });
  } else {
    db.signup(req, res, function(err, check) {
      if (check == true) {
        res.json({ code: 200 });
      } else {
        if (err) {
          console.log(err);
        }
        var alert = req.flash("alert")[0] || {};
        var whatinput = {};
        whatinput["username"] = req.body.username || null;
        whatinput["password"] = req.body.password || null;
        whatinput["nickname"] = req.body.nickname || null;
        res.json({ code: 400, alert: alert, form: whatinput });
      }
    });
  }
});
module.exports = router;

function isAuth(req, res, next) {
  if (req.headers.authorization) {
    passport.authenticate("jwt-check", { session: false }, function(
      err,
      check
    ) {
      if (check == false) {
        res.json({ code: 400 });
      } else {
        req.user = check;
        return next();
      }
    })(req, res, next);
  } else {
    res.json({ code: 400 });
  }
}

var express = require("express");
var session = require("express-session");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var compression = require("compression");
var helmet = require("helmet");
var flash = require("connect-flash");
var passport = require("passport");
var passportConfig = require("./config/passport");

var cors = require("cors");

var config = require("./config/config");

var mainSequelize = require("./models/index");

// router variable
var index = require("./routes/index");
var users = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// modules setup
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(helmet());
app.use(flash());
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 3600000, httpOnly: true },
    rolling: true
  })
);
app.use(cors());

// passport serialize & deserialize
app.use(passport.initialize());
passportConfig();

// router
app.use("/", index);
app.use("/api/users", users);

mainSequelize.sequelize
  .sync()
  .then(() => {
    console.log("DB Connection OK!");
  })
  .catch(err => {
    console.log("DB Connection err : ", err);
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

/* token verify */
var config = require("../config/config");
var jwt = require("jsonwebtoken");

/* DB */
var db = require("./SocketDb");

/* socket */
var socket_io = require("socket.io");
var io = socket_io();

var socketApi = {};

socketApi.io = io;

io.on("connection", function(socket) {
  console.log("A user connected");

  /* Make a new Room */

  /* chat message */
  socket.on("chat-push", function(msg) {
    let parse;
    try {
      parse = JSON.parse(msg);
    } catch (e) {
      console.log(e);
      io.emit("chat-pull", { code: 400, error: "잘못된 형식의 입력입니다." });
    }
    try {
      nickname = jwt.verify(parse.token.substring(4), config.JWT_SECRET)
        .nickname;
      io.emit("chat-pull", { code: 200, nickname: nickname, text: parse.text });
    } catch (e) {
      console.log(e);
      io.emit("chat-pull", { code: 400, error: "잘못된 token입니다." });
    }
  });

  /* disconnect */
  socket.on("disconnect", function() {
    console.log("user disconnected");
  });
});

module.exports = socketApi;

/* token verify */
var config = require("../config/config");
var jwt = require("jsonwebtoken");

/* DB */
var db = require("./SocketDb");

/* socket */
var socket_io = require("socket.io");
var io = socket_io();

var socketApi = {};

/* global-chat */
socketApi.io = io;

io.on("connection", function(socket) {
  console.log("A user connected");

  /* retrive limit 10 items */
  socket.on("get-chat-list", function(msg) {
    db.getGlobalChat(function(err, result) {
      if (err) {
        console.log(err);
        socket.emit("chat-pull", {
          code: 400,
          error: "서버 로드 오류"
        });
      } else {
        result.map(info => {
          db.getNickname(info.author, function(err, result) {
            if (err) {
              console.log(err);
              socket.emit("chat-pull", {
                code: 400,
                error: "서버 로드 오류"
              });
            } else {
              socket.emit("chat-pull", {
                code: 200,
                nickname: result,
                text: info.text
              });
            }
          });
        });
      }
    });
  });

  /* chat message */
  socket.on("chat-push", function(msg) {
    let parse;
    try {
      parse = JSON.parse(msg);
    } catch (e) {
      console.log(e);
      scoket.emit("chat-pull", {
        code: 400,
        error: "잘못된 형식의 api 호출입니다."
      });
    }
    try {
      info = jwt.verify(parse.token.substring(4), config.JWT_SECRET);
      nickname = info.nickname;
      console.log(info);
      db.newGlobalChat(info, parse, function(err, check) {
        if (err) {
          console.log(err);
          socket.emit("chat-pull", {
            code: 400,
            error: "서버 저장 오류"
          });
        } else {
          io.emit("chat-pull", {
            code: 200,
            nickname: nickname,
            text: parse.text
          });
        }
      });
    } catch (e) {
      console.log(e);
      socket.emit("chat-pull", {
        code: 400,
        error: "잘못된 token입니다. 새로 로그인 해주시길 바랍니다."
      });
    }
  });

  /* disconnect */
  socket.on("disconnect", function() {
    console.log("user disconnected");
  });
});

/* private-chat */

io.of("/private-msg").on("connection", function(socket) {
  console.log("private Connected");
  /* retrive limit 10 items */
  socket.on("get-chat-list", function(msg) {
    db.getGlobalChat(function(err, result) {
      if (err) {
        console.log(err);
        socket.emit("chat-pull", {
          code: 400,
          error: "서버 로드 오류"
        });
      } else {
        result.map(info => {
          db.getNickname(info.id, function(err, result) {
            if (err) {
              console.log(err);
              socket.emit("chat-pull", {
                code: 400,
                error: "서버 로드 오류"
              });
            } else {
              socket.emit("chat-pull", {
                code: 200,
                nickname: result,
                text: info.text
              });
            }
          });
        });
      }
    });
  });
});

module.exports = socketApi;

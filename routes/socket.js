/* token verify */
var config = require("../config/config");
var jwt = require("jsonwebtoken");

/* DB */
var db = require("./SocketDB");

/* socket */
var socket_io = require("socket.io");
var io = socket_io();

var socketApi = {};

/**
 *
 *   Global-chat
 *
 *  */
socketApi.io = io;

var members = [];

io.on("connection", function(socket) {
  console.log("Global 로그인헀음");

  /* retrive limit 10 items */
  socket.on("get-chat-list", function(msg) {
    parseJSON(msg, function(err, parse) {
      if (err) {
        emitErr(socket, "잘못된 형식 입니다.");
      } else {
        /* parse Token */
        parseToken(parse, function(err, info) {
          if (err) {
            console.log(err);
            emitErr(
              socket,
              "잘못된 token입니다. 새로 로그인 해주시길 바랍니다."
            );
          } else {
            db.setSocketId(info.id, socket.id, function(err, check) {
              if (err) {
                console.log(err);
                emitErr(socket, "소켓 아이디 설정 오류");
              } else {
                members.push(info.nickname);

                /* make a set */
                members = members.reduce(function(a, b) {
                  if (a.indexOf(b) < 0) a.push(b);
                  return a;
                }, []);

                db.getGlobalChat(function(err, result) {
                  if (err) {
                    console.log(err);
                    emitErr(socket, "서버 글로벌 채팅 로드 오류");
                  } else {
                    result.map(info => {
                      db.getNickname(info.author, function(err, result) {
                        if (err) {
                          console.log(err);
                          emitErr(socket, "서버 닉네임 로드 오류");
                        } else {
                          socket.emit("chat-pull", {
                            code: 200,
                            nickname: result,
                            text: info.text,
                            time: info.createdAt
                          });
                        }
                      });
                    });
                    socket.broadcast.emit("member-in", {
                      code: 200,
                      nickname: info.nickname,
                      time: "system"
                    });
                    socket.emit("member-list", {
                      code: 200,
                      members: members
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  });

  /* chat message */
  socket.on("chat-push", function(msg) {
    /* parse */
    parseJSON(msg, function(err, parse) {
      if (err) {
        emitErr(socket, "잘못된 형식 입니다.");
      } else {
        /* parse Token */
        parseToken(parse, function(err, info) {
          if (err) {
            console.log(err);
            emitErr(
              socket,
              "잘못된 token입니다. 새로 로그인 해주시길 바랍니다."
            );
          } else {
            db.newGlobalChat(info, parse, function(err, time) {
              if (err) {
                console.log(err);
                emitErr(socket, "서버 저장 오류");
              } else {
                io.emit("chat-pull", {
                  code: 200,
                  nickname: info.nickname,
                  text: parse.text,
                  time: time
                });
              }
            });
          }
        });
      }
    });
  });

  /* disconnect */
  socket.on("disconnect", function() {
    db.whoSocketId(socket.id, function(err, info) {
      if (err) {
        console.log(err);
      } else {
        if (info) {
          members.splice(members.indexOf(info.nickname), 1);
          io.emit("member-out", {
            code: 200,
            nickname: info.nickname,
            time: info.time
          });
        }
      }
    });
    console.log("GLOBAL 디스커넥트했음");
  });
});

/**
 *
 *  Private Chat
 *
 */

io.of("/private-msg").on("connection", function(socket) {
  console.log("private login 했음");
  /* nickname valid check */
  socket.on("get-valid", function(msg) {
    /* parse */
    parseJSON(msg, function(err, parse) {
      if (err) {
        emitErr(socket, "잘못된 형식 입니다.");
      } else {
        /* token parse */
        parseToken(parse, function(err, info) {
          if (err) {
            console.log(err);
            emitErr(
              socket,
              "잘못된 token입니다. 새로 로그인 해주시길 바랍니다."
            );
          } else {
            try {
              if (parse.nickname == info.nickname) {
                emitErr(socket, "혼잣말은 이상한 사람처럼 보입니다.");
              } else {
                db.checkNickname(parse.nickname, function(err, result) {
                  if (err || !result || Object.keys(result).length === 0) {
                    emitErr(socket, "없는 닉네임입니다.");
                  } else {
                    socket.emit("valid-pull", {
                      code: 200
                    });
                  }
                });
              }
            } catch (e) {
              console.log(e);
              emitErr(socket, "잘못된 형식의 api 호출입니다.");
            }
          }
        });
      }
    });
  });

  /* retrive chat items */
  socket.on("get-chat-list", function(msg) {
    /* parse */
    parseJSON(msg, function(err, parse) {
      if (err) {
        emitErr(socket, "잘못된 형식 입니다.");
      } else {
        /* token parse */
        parseToken(parse, function(err, info) {
          if (err) {
            console.log(err);
            emitErr(
              socket,
              "잘못된 token입니다. 새로 로그인 해주시길 바랍니다."
            );
          } else {
            console.log(info);
            db.getPrivateChatList(info.id, function(err, result) {
              if (err) {
                console.log(err);
                emitErr(socket, "서버 채팅 목록 로드 오류");
              } else {
                /* make set*/
                result = result
                  .map(a => a.get())
                  .reduce(function(a, b) {
                    if (a.indexOf(b) < 0) a.push(b);
                    return a;
                  }, []);

                /* list-pull */
                db.setSocketId(info.id, socket.id, function(err, check) {
                  if (err) {
                    console.log(err);
                    emitErr(socket, "소켓 아이디 설정 오류");
                  } else {
                    result.map(ans => {
                      db.getNickname(
                        ans.author != info.id ? ans.author : ans.to,
                        function(err, result) {
                          if (err) {
                            console.log(err);
                            emitErr(socket, "서버 닉네임 로드 오류");
                          } else {
                            socket.emit("list-pull", {
                              code: 200,
                              nickname: result
                            });
                          }
                        }
                      );
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  });

  /* chat push */
  socket.on("get-chat-private", function(msg) {
    /* parse */
    parseJSON(msg, function(err, parse) {
      if (err) {
        emitErr(socket, "잘못된 형식 입니다.");
      } else {
        /* token parse */
        parseToken(parse, function(err, info) {
          if (err) {
            console.log(err);
            emitErr(
              socket,
              "잘못된 token입니다. 새로 로그인 해주시길 바랍니다."
            );
          } else {
            db.checkNickname(parse.target, function(err, targetInfo) {
              if (err || !targetInfo || Object.keys(targetInfo).length === 0) {
                console.log(err);
                emitErr(socket, "존재하지 않는 닉네임입니다.");
              } else {
                db.getPrivateChat(info.id, targetInfo.id, function(
                  err,
                  result
                ) {
                  if (err) {
                    console.log(err);
                    emitErr(socket, "서버 개인 채팅 로드 오류");
                  } else {
                    result.map(info => {
                      db.getNickname(info.author, function(err, result) {
                        if (err) {
                          console.log(err);
                          emitErr(socket, "서버 닉네임 로드 오류");
                        } else {
                          socket.emit("chat-pull", {
                            code: 200,
                            nickname: result,
                            text: info.text,
                            time: info.createdAt
                          });
                        }
                      });
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  });

  /* chat push */
  socket.on("chat-push", function(msg) {
    /* parse */
    parseJSON(msg, function(err, parse) {
      if (err) {
        emitErr(socket, "잘못된 형식 입니다.");
      } else {
        /* token parse */
        parseToken(parse, function(err, info) {
          if (err) {
            console.log(err);
            emitErr(
              socket,
              "잘못된 token입니다. 새로 로그인 해주시길 바랍니다."
            );
          } else {
            db.newPrivateChat(info, parse, function(err, time) {
              if (err) {
                console.log(err);
                emitErr(socket, "서버 저장 오류");
              } else {
                socket.emit("chat-pull", {
                  code: 200,
                  nickname: info.nickname,
                  text: parse.text,
                  time: time
                });
                /* getSocket */
                db.getSocketId(parse.target, function(err, result) {
                  if (err) {
                    console.log(err);
                    emitErr(socket, "상대방 전송 오류");
                  } else {
                    socket.to(result).emit("alarm-pull", {
                      code: 200,
                      from: info.nickname,
                      nickname: info.nickname,
                      text: parse.text,
                      time: time
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  });

  /* disconnect */
  socket.on("disconnect", function() {
    console.log("Private 디스커넥트했음");
  });
});

module.exports = socketApi;

/* convert to json */
function parseJSON(json, callback) {
  let parse;
  try {
    parse = JSON.parse(json);
    return callback(null, parse);
  } catch (e) {
    return callback(e, null);
  }
}

/* parse token valid */
function parseToken(parse, callback) {
  try {
    return callback(
      null,
      jwt.verify(parse.token.substring(4), config.JWT_SECRET)
    );
  } catch (e) {
    return callback(e, null);
  }
}

/* emit Error message */
function emitErr(socket, text) {
  console.log(text);
  socket.emit("err-pull", {
    code: 400,
    error: text
  });
}

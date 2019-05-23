var socket_io = require("socket.io");
var io = socket_io();
var socketApi = {};

socketApi.io = io;

io.on("connection", function(socket) {
  console.log("A user connected");

  /* 채팅 메세지 */
  socket.on("chat-push", function(msg) {
    console.log("msg: " + msg);
    io.emit("chat-pull", msg);
  });

  /* 연결끊김 */
  socket.on("disconnect", function() {
    console.log("user disconnected");
  });
});

socketApi.sendNotification = function() {
  io.sockets.emit("hello", { msg: "Hello World!" });
};

module.exports = socketApi;

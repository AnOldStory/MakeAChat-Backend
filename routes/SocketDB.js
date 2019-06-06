var Models = require("../models");
var Sequelize = require("sequelize");
var Op = Sequelize.Op;

/**
 *    Socket Controller
 */

/* Create GlobalChat */
exports.newGlobalChat = (info, parse, callback) => {
  Models.GlobalChats.create({
    author: info.id,
    text: parse.text
  })
    .then(result => {
      if (result) {
        return callback(null, result.createdAt);
      } else {
        return callback(null, false);
      }
    })
    .catch(err => {
      return callback(err, false);
    });
};

/* Get 10 From GlobalChat */
exports.getGlobalChat = callback => {
  Models.GlobalChats.findAll({ limit: 20, order: [["updatedAt", "DESC"]] })
    .then(result => {
      console.log(result);
      return callback(null, result);
    })
    .catch(err => {
      return callback(err, false);
    });
};

/* Create PrivateChat */
exports.newPrivateChat = (info, parse, callback) => {
  Models.Users.findOne({
    where: { nickname: parse.target },
    attributes: ["id"]
  })
    .then(result => {
      Models.PrivateChats.create({
        author: info.id,
        to: result.id,
        text: parse.text
      })
        .then(result => {
          if (result) {
            return callback(null, result.createdAt);
          } else {
            return callback(null, false);
          }
        })
        .catch(err => {
          return callback(err, false);
        });
    })
    .catch(err => {
      return err, false;
    });
};

/* Get Message From PrivateChat*/
exports.getPrivateChat = (author, id, callback) => {
  Models.PrivateChats.findAll({
    where: {
      [Op.or]: [
        { [Op.and]: [{ to: id }, { author: author }] },
        { [Op.and]: [{ to: author }, { author: id }] }
      ]
    },
    order: [["updatedAt", "DESC"]]
  })
    .then(result => {
      return callback(null, result);
    })
    .catch(err => {
      return callback(err, false);
    });
};

/* Get List From PrivateChat*/
exports.getPrivateChatList = (id, callback) => {
  Models.PrivateChats.findAll({
    where: {
      [Op.or]: [{ to: id }, { author: id }]
    },
    attributes: { exclude: ["id"] }
  })
    .then(result => {
      return callback(null, result);
    })
    .catch(err => {
      return callback(err, false);
    });
};

/* getNickname with Pk */
exports.getNickname = (Pk, callback) => {
  Models.Users.findByPk(Pk)
    .then(result => {
      return callback(null, result.nickname);
    })
    .catch(err => {
      return callback(err, false);
    });
};

/* checkNickname Valid*/

exports.checkNickname = (nickname, callback) => {
  Models.Users.findOne({ where: { nickname: nickname } })
    .then(result => {
      return callback(null, result);
    })
    .catch(err => {
      return callback(err, false);
    });
};

/* getNickanme List */
exports.getNicknameAll = callback => {
  Models.Users.findAll({
    attributes: "username"
  })
    .then(result => {
      return callback(null, result);
    })
    .catch(err => {
      return callback(err, false);
    });
};

/* set SocketId to User */
exports.setSocketId = (id, socketId, callback) => {
  Models.Users.update({ socket: socketId }, { where: { id: id } })
    .then(result => {
      if (result) {
        return callback(null, result.createdAt);
      } else {
        return callback(null, false);
      }
    })
    .catch(err => {
      return callback(err, false);
    });
};

/* get SocketId From User */
exports.getSocketId = (nickname, callback) => {
  Models.Users.findOne(
    { where: { nickname: nickname } },
    { attributes: "socket" }
  )
    .then(result => {
      if (result) {
        return callback(null, result.socket);
      } else {
        return callback(null, false);
      }
    })
    .catch(err => {
      return callback(err, false);
    });
};

exports.whoSocketId = (socketid, callback) => {
  Models.Users.findOne(
    { where: { socket: socketid } },
    { attributes: ["nickname", "createdAt"] }
  )
    .then(result => {
      if (result) {
        Models.Users.update({ socket: null }, { where: { socket: socketid } })
          .then(check => {
            if (check) {
              return callback(null, result);
            } else {
              return callback(null, false);
            }
          })
          .catch(err => {
            return callback(err, false);
          });
      } else {
        return callback(null, false);
      }
    })
    .catch(err => {
      return callback(err, false);
    });
};

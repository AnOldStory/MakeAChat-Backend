var Models = require("../models");

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
        return callback(null, true);
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
  Models.GlobalChats.findAll({ limits: 10 })
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
      return callback(null, result.get().nickname);
    })
    .catch(err => {
      return callback(err, false);
    });
};

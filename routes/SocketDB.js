var Models = require("../models");

/**
 *    Socket Controller
 */

/* Make a new Room*/
exports.newRoom = (req, res, callback) => {
  Models.Chats.create({
    author: req.body.author || "없습니다.",
    text: req.body.text || "공백"
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

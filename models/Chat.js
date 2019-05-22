module.exports = function(sequelize, Datatypes) {
  var Chats = sequelize.define("Chats", {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Datatypes.INTEGER
    },
    author: {
      type: Datatypes.STRING(100)
    },
    text: {
      type: Datatypes.STRING(100)
    }
  });

  return Chats;
};

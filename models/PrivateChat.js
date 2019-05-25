module.exports = function(sequelize, Datatypes) {
  var PrivateChats = sequelize.define("PrivateChats", {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Datatypes.INTEGER
    },
    author: {
      type: Datatypes.INTEGER
    },
    to: {
      type: Datatypes.INTEGER
    },
    text: {
      type: Datatypes.STRING(1000)
    }
  });

  return PrivateChats;
};

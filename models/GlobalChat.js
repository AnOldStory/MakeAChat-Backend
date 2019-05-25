module.exports = function(sequelize, Datatypes) {
  var GlobalChats = sequelize.define("GlobalChats", {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Datatypes.INTEGER
    },
    author: {
      type: Datatypes.INTEGER
    },
    text: {
      type: Datatypes.STRING(1000)
    }
  });

  return GlobalChats;
};

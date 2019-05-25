module.exports = function(sequelize, Datatypes) {
  var Rooms = sequelize.define("Rooms", {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Datatypes.INTEGER
    },
    name: {
      type: Datatypes.STRING(100)
    },
    who: {
      type: Datatypes.ARRAY(Datatypes.TEXT)
    }
  });

  return Rooms;
};

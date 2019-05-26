var bcrypt = require("bcrypt-nodejs");

module.exports = function(sequelize, Datatypes) {
  var Users = sequelize.define("Users", {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: Datatypes.INTEGER
    },
    username: {
      type: Datatypes.STRING(100),
      unique: true
    },
    nickname: {
      type: Datatypes.STRING(20),
      unique: true
    },
    password: {
      type: Datatypes.STRING(100)
    },
    socket: {
      type: Datatypes.STRING(50)
    }
  });

  Users.prototype.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
  };

  // Hooks are automatic methods that run during various phases of the User Model lifecycle
  // In this case, before a User is created, we will automatically hash their password
  Users.beforeCreate(function(user) {
    user.password = bcrypt.hashSync(
      user.password,
      bcrypt.genSaltSync(10),
      null
    );
  });

  return Users;
};

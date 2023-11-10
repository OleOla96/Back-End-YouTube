const config = require("../config/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: false,

    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user.model.js")(sequelize, Sequelize);
db.followers = require("./follower.model.js")(sequelize, Sequelize);
db.roles = require("./role.model.js")(sequelize, Sequelize);
db.contents = require("./content.model.js")(sequelize, Sequelize);
db.likers = require("./like.model.js")(sequelize, Sequelize);

db.roles.belongsToMany(db.users, {
  through: "user_roles"
});

db.users.belongsToMany(db.roles, {
  through: "user_roles"
});

db.users.hasMany(db.followers, { as: 'Followers', foreignKey: 'userId' });
db.followers.belongsTo(db.users, { as: 'User', foreignKey: 'userId' });

db.users.hasMany(db.contents);
db.contents.belongsTo(db.users);

db.contents.hasMany(db.likers, { as: 'Like', foreignKey: 'contentId' });
db.likers.belongsTo(db.contents, { as: 'Content', foreignKey: 'contentId' });

module.exports = db;
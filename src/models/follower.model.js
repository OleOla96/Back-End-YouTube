module.exports = (sequelize, Sequelize) => {
  const Followers = sequelize.define("followers", {
    userId: {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false,
    },
    followerId: {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: false,
    },
    status: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }
  });

  return Followers;
};
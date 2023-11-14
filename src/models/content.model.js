module.exports = (sequelize, Sequelize) => {
  const contents = sequelize.define('contents', {
    id: {
      type: Sequelize.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    linkVideo: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    videoName: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    published: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    view: {
      type: Sequelize.BIGINT.UNSIGNED,
      defaultValue: 0,
    },
    like: {
      type: Sequelize.MEDIUMINT.UNSIGNED,
      defaultValue: 0,
    },
    disLike: {
      type: Sequelize.MEDIUMINT.UNSIGNED,
      defaultValue: 0,
    },
  });
  return contents;
};

// {
//   charset: 'utf8',
//   collate: 'utf8_unicode_ci',
// }

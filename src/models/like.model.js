module.exports = (sequelize, Sequelize) => {
    const Likers = sequelize.define("likers", {
        contentId: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
        },
        likerId: {
            type: Sequelize.BIGINT.UNSIGNED,
            allowNull: false,
        },
        status: {
            type: Sequelize.BOOLEAN,
            allowNull: true,
        }
    });
  
    return Likers;
};
module.exports = (sequelize, Sequelize) => {
	const Role = sequelize.define('roles', {
		id: {
			primaryKey: true,
			type: Sequelize.SMALLINT.UNSIGNED,
			validate: {
				min: 1,
				max: 3,
			},
			autoIncrement: true,
		},
		name: {
			type: Sequelize.STRING,
			unique: true,
		},
	})

	return Role
}

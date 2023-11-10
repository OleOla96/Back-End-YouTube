const db = require('./models')
var bcrypt = require('bcryptjs')
const Roles = db.roles
const User = db.users
const Contents = db.contents

const initDb = {
	roles() {
		const roles = ['user', 'moderator', 'admin']
		for (const role of roles) {
			Roles.create({
				name: role,
			})
		}
	},
	users: async () => {
		const users = [
			{
				name: 'oleola',
				email: 'oleola@gmail.com',
				password: 'Truong123@',
			},
			{
				name: 'tester1',
				email: 'tester1@gmail.com',
				password: 'Truong123@',
			},
			{
				name: 'tester2',
				email: 'tester2@gmail.com',
				password: 'Truong123@',
			},
			{
				name: 'tester3',
				email: 'tester3@gmail.com',
				password: 'Truong123@',
			},
			{
				name: 'tester4',
				email: 'tester4@gmail.com',
				password: 'Truong123@',
			},
		]
		for (const user of users) {
			const hashedPwd = await bcrypt.hash(user.password, 8)
			const newUser = await User.create({
				username: user.name,
				password: hashedPwd,
				email: user.email,
				channelName: user.name,
			})
			await newUser.setRoles([1])
		}
	},
	contents: async () => {
		const contents = [
			{
				userId: 1,
				title: 'Psycho',
				linkVideo: 'Z7yNvMzz2zg',
				description: 'description 1',
				published: true,
			},
			{
				userId: 1,
				title: 'ILLELLA',
				linkVideo: 'Vz508O9NNTg',
				description: 'description 2',
				published: true,
			},
			{
				userId: 2,
				title: 'Young, Dumb, Stupid',
				linkVideo: 'Qx8WSG5GKXc',
				description: 'description 3',
				published: true,
			},
			{
				userId: 3,
				title: 'Love Me Like This',
				linkVideo: 'Vt4JMe-I0cE',
				description: 'description 4',
				published: true,
			},
			{
				userId: 4,
				title: 'DUN DUN',
				linkVideo: 'NoYKBAajoyo',
				description: 'description 5',
				published: true,
			},
			{
				userId: 4,
				title: 'STUDY WITH ME 2 hours',
				linkVideo: 'Hpfl1iNOd48',
				description: 'Pomodoro 25/5, The national library of Finland',
				published: true,
			},
		]
		await Contents.bulkCreate(contents)
	},
}

module.exports = initDb

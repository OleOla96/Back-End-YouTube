const jwt = require('jsonwebtoken')
const db = require('../models')
const Users = db.users

const authJwt = {
	verifyTokenRequired: (req, res, next) => {
		const authHeader = req.headers.authorization || req.headers.Authorization
		if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401)
		const token = authHeader.split(' ')[1]

		if (!token) {
			return res.status(401).send({
				message: 'No token provided!',
			})
		}

		jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, decoded) => {
			if (err) {
				console.log(err)
				return res.status(403).send(err)
			}
			req.userId = decoded.id
			next()
		})
	},
	verifyTokenNotRequired: (req, res, next) => {
		const authHeader = req.headers.authorization || req.headers.Authorization
		if (!authHeader?.startsWith('Bearer ')) return next()
		const token = authHeader.split(' ')[1]

		if (!token) {
			return next()
		}

		jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, decoded) => {
			if (err) {
				console.log(err)
				return res.status(403).send(err)
			}
			req.userId = decoded.id
			next()
		})
	},

	isAdmin: async (req, res, next) => {
		try {
			const user = await Users.findOne({ where: { id: req.userId } })
			if (user) {
				const getRoles = await user.getRoles()
				if (getRoles?.find((role) => role.name === 'admin')) {
					return next()
				}

				return res.status(403).send({
					message: 'Require Admin Role!',
				})
			}
		} catch (error) {
			return res.status(403).send(error.message)
		}
	},

	isModerator: async (req, res, next) => {
		try {
			const user = await Users.findOne({ where: { id: req.userId } })
			if (user) {
				const getRoles = await user.getRoles()
				if (getRoles?.find((role) => role.name === 'moderator')) {
					return next()
				}

				return res.status(403).send({
					message: 'Require Moderator Role!',
				})
			}
		} catch (error) {
			return res.status(403).send(error.message)
		}
	},

	isModeratorOrAdmin: async (req, res, next) => {
		try {
			const user = await Users.findOne(req.userId)
			if (user) {
				const roles = await user.getRoles()
				for (let i = 0; i < roles.length; i++) {
					if (roles[i].name === 'moderator') {
						next()
						return
					}

					if (roles[i].name === 'admin') {
						next()
						return
					}
				}

				res.status(403).send({
					message: 'Require Moderator or Admin Role!',
				})
			}
		} catch (error) {
			return res.status(403).send(error.message)
		}
	},
}
module.exports = authJwt

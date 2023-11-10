const express = require('express')
const route = express.Router()
const { authJwt } = require('../middleware')
const rolesController = require('../controllers/roles.controller')

route.get('/user', authJwt.verifyTokenRequired, rolesController.userBoard)
route.get(
  '/moderator',
  [authJwt.verifyTokenRequired, authJwt.isModerator],
  rolesController.moderatorBoard
)
route.get(
  '/admin',
  [authJwt.verifyTokenRequired, authJwt.isAdmin],
  rolesController.adminBoard
)

module.exports = route

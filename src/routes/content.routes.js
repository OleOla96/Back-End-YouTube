const express = require('express')
const route = express.Router()
const { authJwt } = require('../middleware')
const contentsController = require('../controllers/contents.controller')

route.patch('/subscriber', authJwt.verifyTokenRequired, contentsController.subcribe)
route.patch('/like', authJwt.verifyTokenRequired, contentsController.like)

module.exports = route

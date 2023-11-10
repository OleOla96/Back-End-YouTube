const express = require('express')
const route = express.Router()
const searchController = require('../controllers/search.controller')

route.get("/title", searchController.public)

module.exports = route
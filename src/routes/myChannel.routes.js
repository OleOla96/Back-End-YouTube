const express = require('express');
const route = express.Router();
const { authJwt } = require('../middleware');
const verifyImage = require('../middleware/verifyImage');
const contentsController = require('../controllers/contents.controller');
const profileController = require('../controllers/profile.controller');

route.get('/', authJwt.verifyTokenRequired, profileController.myChannel);
route.get('/watch/:linkVideo', authJwt.verifyTokenRequired, contentsController.watchPrivate);
route.put('/editAvatar', authJwt.verifyTokenRequired, verifyImage, profileController.editAvatar);

module.exports = route;

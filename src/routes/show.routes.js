const express = require('express');
const route = express.Router();
const { authJwt } = require('../middleware');
const profileController = require('../controllers/profile.controller');
const contentsController = require('../controllers/contents.controller');

route.get('/all', authJwt.verifyTokenNotRequired, contentsController.showAll);
route.get('/watch/:linkVideo', authJwt.verifyTokenNotRequired, contentsController.watch);
route.get('/visitchannel/:channelname', authJwt.verifyTokenNotRequired, profileController.visitChannel);

module.exports = route;

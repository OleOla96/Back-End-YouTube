const express = require('express');
const route = express.Router();
const { authJwt } = require('../middleware');
const verifyVideo = require('../middleware/verifyVideo');
const crudController = require('../controllers/crud.controller');

route.put('/upload', authJwt.verifyTokenRequired, verifyVideo, crudController.upload);
route.get('/mycontents', authJwt.verifyTokenRequired, verifyVideo, crudController.myContents);
route.patch('/update', authJwt.verifyTokenRequired, verifyVideo, crudController.update);
route.delete('/delete/:id', authJwt.verifyTokenRequired, crudController.delete);
route.delete('/delete', authJwt.verifyTokenRequired, crudController.multipleDelete);

//old
// route.put('/create', authJwt.verifyTokenRequired, crudController.create);
// route.get('/mycontents', authJwt.verifyTokenRequired, crudController.mycontents);
// route.patch('/update', authJwt.verifyTokenRequired, crudController.update);
// route.delete('/delete/:id', authJwt.verifyTokenRequired, crudController.delete);
// route.delete('/delete', authJwt.verifyTokenRequired, crudController.delete);

module.exports = route;

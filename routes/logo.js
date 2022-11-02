const express = require( 'express' );
const logoRoute = express.Router();
const logoController =require('../controllers/logo')

logoRoute.post('/projectlogo',logoController.addLogo);
logoRoute.get('/getLogo',logoController.getLogo)

module.exports = logoRoute
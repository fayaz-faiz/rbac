const express = require( 'express' );
const Route = express.Router();
const forgot = require('../controllers/forgotPassword')

Route.post('/forgotPassword',forgot.forgotPassword);
Route.put('/changeForgotPassword',forgot.changeForgotPassword)

module.exports = Route
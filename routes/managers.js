const express = require( 'express' );
const router = express.Router();
const managers = require( '../controllers/managers.controller' );
const auth = require('../middlewares/auth')

router.get('/get-managers',auth.authorizeAdmin,managers.getAllManagers);
router.post('/assignProject',auth.authorizeAdmin,managers.AssignedProjects)
router.get('/getMyProjectList/:userId',managers.listOfProjects)
router.put( '/edit-manager',auth.authorizeAdmin,managers.editManager );
router.delete('/remove-manager/:ID',auth.authorizeAdmin,managers.deleteManager);
router.post('/assignProject',auth.authorizeAdmin,managers.AssignedProjects)

module.exports = router;
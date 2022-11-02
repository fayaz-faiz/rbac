const express = require('express');
const router = express.Router();
const teamLead = require('../controllers/teamLead.controller');
const auth = require('../middlewares/auth')


router.get('/getList',auth.authorizeManager,teamLead.getTeamLeadList);
router.put('/updateLead',auth.authorizeManager,teamLead.updateTeamLead);
router.delete('/removeLead/:ID',auth.authorizeAdmin,teamLead.removeLead)
router.post('/assignProjectToLead',auth.authorizeManager,teamLead.AssignedProjectsToLead)


module.exports = router;
const express = require('express');
const router = express.Router();
const teamMember = require('../controllers/teamMember')
const auth = require('../middlewares/auth')

router.get('/getMembers',auth.authorizeTeamLead,teamMember.getAllTeamMembers);
router.put('/updateMember',auth.authorizeAdmin,teamMember.editTeamMember);
router.delete('/removeMember/:ID',auth.authorizeAdmin,teamMember.removeTeamMember);
router.post('/AssignedProjectToteamMember',auth.authorizeTeamLead,teamMember.AssignedProjectsToTeamMember);

module.exports = router
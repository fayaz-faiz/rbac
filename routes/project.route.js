const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const auth = require('../middlewares/auth')

router.get('/get-projects', auth.authorizeAll, projectController.getProjects);
router.post('/add-project', auth.authorizeAdmin, projectController.addProject);
router.put('/edit-project', auth.authorizeAdmin, projectController.editProject);
router.delete('/delete-project/:ID', auth.authorizeAdmin, projectController.deleteProject);

module.exports = router;
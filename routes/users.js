const express = require('express');
const multer = require('multer');
const userRoute = express.Router();
const userController = require('../controllers/users')
const auth = require('../middlewares/auth')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    console.log("----",file);
    cb(null, file.originalname)
    console.log("----", file.originalname);
  }
})

const upload = multer({
  dest: 'uploads/', storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 2,
  }
})


userRoute.post('/login', userController.login);
userRoute.get('/logout', userController.logout)
userRoute.post('/addUsers', auth.authorizeAdmin, userController.addUser);
userRoute.get('/getUsers', auth.authorizeAll, userController.getUsers);
userRoute.put('/updateUser', auth.authorizeAdmin, userController.editUser);
userRoute.delete('/removeUser/:ID', auth.authorizeAdmin, userController.deleteUser);
userRoute.put('/firebaseToken', auth.authorizeAll, userController.fireBaseToken)
userRoute.post('/uploadProfileImg', upload.single('profile'), userController.uploadProfileImg)
userRoute.get('/getProfile/:id',userController.getProfile)
userRoute.put('/changePassword', auth.authorizeAll, userController.changepassword);
userRoute.get('/getNotification',userController.getNotifications)
module.exports = userRoute;




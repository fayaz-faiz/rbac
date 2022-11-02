const bcrypt = require('bcryptjs');
const userModel = require('../models/users');
const roles = require("../models/roles")
const managers = require('../models/managers');
const lead = require('../models/teamLead')
const member = require('../models/teamMember')
const jwt = require('jsonwebtoken');
const pushMsg = require('../notifications');
const permissionsModel = require('../models/permissions')
const rolePermissions = require('../models/rolePermissions')
var mongoose = require('mongoose');
const notification = require('../models/notifiactions.model')
const fs = require("fs")
const logger = require('../utils/winston')

const uploadProfileImg = async (req, res, next) => {
    const { id } = req.body
    try {
        logger.log({
            level:"info",
            message:"To upload the profile image of the user"
        })
        if(id){
            const iD = mongoose.Types.ObjectId(id);
            const img = req.file.originalname
            const {image} = await userModel.findOne({_id:iD})
            const filePath='uploads/'+image
            fs.stat(filePath, function (err) {
                if (err) {
                    return console.error(err);
                }
                fs.unlink(filePath,function(err){
                     if(err) return console.log(err);
                     console.log('file deleted successfully');
                });  
             });
            await userModel.updateOne({
                _id: iD,
            }, {
                $set: {
                   image:img
                }
            })
            res.json({
                statusCode:200,
                message:"profile picture added successfully"
            })
        }else{
            res.json({
                statusCode:"provide a valid id to update the profile"
            })
        }
    } catch (err) {
        logger.log({
            level:"error",
            message:"Error in upload the profile image of the user" + err
        })
        next(err)
    }

}

const getProfile=async(req,res,next)=>{
   const {id} = req.params
   try{
    logger.log({
        level:"info",
        message:"To get the profile image in user",
    })
    if(id){
        const iD = mongoose.Types.ObjectId(id);
        const user = await userModel.findOne({_id:iD})
      
        if(user){
          const {fname,lname,email,date,image} =  user || {}
          res.json({
            statusCode:200,
            message:"fetched the profile details successfully",
            data:{
                fname,
                lname,
                email,
                date,
                image
            }
          })
        }else{
            res.json({
                statusCode:400,
                message:"no user with user Id"+ id + "provided"
            })
        }
    }else{
        res.json({
            statusCode:400,
            message:"provide a valid user id"
        })
    }
    
   }catch(err){
    logger.log({
        level:"error",
        message:"Error in getting the profile image for user" + err
    })
       next(err)
   }
}

const addUser = async (req, res, next) => {
    const { fname, lname, email, password, role, department, manager, teamLead} = req.body;
    try {
        logger.log({
            level:"info",
            message:"To add the new User in the User List"
        })
        if (email && password && fname && lname && role && department) {
            const userExists = await userModel.findOne({ email: email }).lean();
            if (userExists) {
                res.json({
                    statusCode: 400,
                    message: 'Email already exists',
                })
            } else if (password.length < 8) {
                res.json({
                    statusCode: 400,
                    message: "password should have more than 8 characters"
                })
            } else {
                const saltRounds = 10;
                // salting
                //it iterates the password 2^10 times and then 
                //generate Salt for my password which need to encrypted
                const salt = await bcrypt.genSalt(saltRounds)
                // hashing
                const hasedPassword = await bcrypt.hash(password, salt)
                const { _id } = await roles.findOne({ roleName: role })
                await userModel.insertMany([{
                    fname,
                    lname,
                    email: email,
                    role: _id,
                    department,
                    password: hasedPassword,
                }])

                if (role == "manager") {
                    await managers.insertMany([{
                        managerName: fname + ' ' + lname,
                        email: email,
                        role: _id,
                        department
                    }])
                }
                if (role == "teamLead") {
                    await lead.insertMany([{
                        leadName: fname + ' ' + lname,
                        email: email,
                        department: department,
                        role: _id
                    }])
                }
                if (role == "teamMember") {
                    await member.insertMany([{
                        memberName: fname + ' ' + lname,
                        email: email,
                        department,
                        role: _id
                    }])
                }
                const message = {
                    notification: {
                        title: "rbac notification",
                        body: "users added successfully",
                    },
                };
                const authHeader = req.headers.authorization;
                const token1 = authHeader.split(' ')[1];
                const payload = jwt.verify(token1, process.env.SECRET_KEY)
                const iD = mongoose.Types.ObjectId(payload._id);
                const user = await userModel.findOne({ _id: iD });
                const { fireBaseToken,fname,lname } = user || {}
                  
                if (fireBaseToken && fireBaseToken.length) {
                    pushMsg.notify(fireBaseToken, message)
                        .then(async(response) => {
                            await notification.insertMany({
                                createdBy: fname + '' + lname,
                                message: message
                            })
                            console.log(response)
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }

                res.json({
                    statusCode: 200,
                    message: 'sucessfully added the user',
                    data: {
                        fname,
                        lname,
                        email,
                        role
                    }
                })


            }

        } else {
            res.json({
                statusCode: 400,
                message: "missing the mandatory fields"
            })
        }
    } catch (err) {
        logger.log({
            level:"error",
            message:"Error in Adding the users" + err
        })
        next(err)
    }
}

const getRolePermissions = async (role) => {
    const { roleName } = await roles.findOne({ _id: parseFloat(role) });
    const { permissions } = await rolePermissions.findOne({ roleName });
    const menus = await permissionsModel.find({ _id: { $in: permissions } }, { _id: 0 });
    return (menus || []).map(obj => obj.rolePermission);
}

const login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        logger.log({
            level:"info",
            message:"To get the role permissions"
        })
        if (email && password) {
            const userData = await userModel.findOne({ email })
            if (userData) {
                const { _id, fname, lname, role } = userData
                const isPasswordMatch = await bcrypt.compare(password, userData.password)

                if (isPasswordMatch) {
                    const payload = {
                        _id,
                        fname,
                        lname,
                        role
                    }
                    const token = jwt.sign(payload, process.env.SECRET_KEY, {
                        expiresIn: '10h'
                    })
                    res.cookie("access_token", token, {
                        httpOnly: true,
                    })
                    const menus = await getRolePermissions(role);
                    await userModel.updateOne({
                        _id: _id,
                    }, {
                        $set: {
                            token: token
                        }
                    })

                    res.json({
                        statusCode: 200,
                        message: 'Login successful',
                        data: {
                            payload,
                            token,
                            menus
                        }
                    })
                } else {
                    res.json({
                        statusCode: 400,
                        message: 'Invalid password'
                    })
                }
            } else {
                res.json({
                    statusCode: 201,
                    message: "Email doesn't exist, Please create account"
                })
            }
        } else {
            res.json({
                statusCode: 400,
                message: "provide correct email and password"
            })
        }
    } catch (err) {
        logger.log({
            level:"error",
            message:"Error in the getting the role permissions" + err
        })
        next(err)
    }
}

const getUsers = async (req, res, next) => {
    const { pageno, pagesize, regex, role, stype, sdir } = req.query;
    try {
        logger.log({
            level:"info",
            message:"To get All the users"
        })
        const Value_match = new RegExp(regex);
        const pageSize = parseInt(pagesize)

        if (pageno && pageSize) {
            if (pageno == 0 || pageSize == 0) {
                res.json(
                    {
                        statuScode: 400,
                        message: "pageno and pagesize cannot be zero"
                    }
                )
            }
        } else {
            res.json({
                statusCode: 400,
                message: "pageno and pagesize is mandatory"
            })
        }

        const getMatch = async () => {
            if (regex && role) {
                const { _id } = await roles.findOne({ roleName: role })
                const qRole = parseInt(_id)
                return [{ "role": qRole, "fname": { $regex: Value_match, $options: 'i' } }]
            } else {
                if (regex) {
                    return [{ "fname": { $regex: Value_match, $options: 'i' } }]
                } else if (role) {
                    const { _id } = await roles.findOne({ roleName: role })
                    const qRole = parseInt(_id)
                    return [{ "role": qRole }]
                } else {
                    return [{}];
                }
            }
        }
        const $or = await getMatch();

        const sort = () => {
            if (stype && sdir) {
                const sDir = parseInt(sdir)
                const sortObj = {};
                sortObj[stype] = sDir
                return sortObj
            } else {
                return { fname: 1 }
            }

        }
        const sorted = sort();
        const count2 = await userModel.find({ $or }).count();
        const users = await userModel.aggregate([{ $match: { $or } }, { $sort: sorted }, { $skip: (pageno - 1) * pageSize }, { $limit: pageSize * 1 }])

        if (!users) {
            res.json({
                statusCode: 200,
                message: "no records matching the input",
            })
        } else {
            res.json({
                statusCode: 200,
                message: "listed the users successfully",
                data: users,
                totalRecords: count2,
                currentPage: pageno
            })
        }
    } catch (error) {
        logger.log({
            level:"error",
            message:"Error in the get users" + error
        })
        next(error)
    }

}
const editUser = async (req, res, next) => {
    const { _id, fname, lname, role, department } = req.body;
    try {
        logger.log({
            level:"info",
            message:"To edit the users" 
        })
        if (_id) {
            const id = mongoose.Types.ObjectId(_id);
            const data = await userModel.findOne({_id:id})
            const authHeader = req.headers.authorization;
            const token1 = authHeader.split(' ')[1];
            const payload = jwt.verify(token1, process.env.SECRET_KEY)
            const iD = mongoose.Types.ObjectId(payload._id);
            const user = await userModel.findOne({ _id: iD });
            const { fireBaseToken } = user || {}
            if(data){
                await userModel.updateOne({
                    _id: id,
                }, {
                    $set: {
                        role,
                        fname,
                        lname,
                        department,
    
                    }
                })
                const message = {
                    notification: {
                        title: "rbac notification",
                        body: "user removed successfully",
                    },
                };
                if (fireBaseToken && fireBaseToken.length) {
                    pushMsg.notify(fireBaseToken, message)
                        .then(async(response) => {
                            await notification.insertMany({
                                createdBy: fname + '' + lname,
                                message: message
                            })
                            console.log(response)
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
                res.json({
                    statusCode: 200,
                    message: `user with id ${_id}  updated successfully`
                })
            }else{
                res.json({
                    statusCode: 400,
                    message: "there is no user with the provided id to update"
                })
            } 
        } else {
            res.json({
                statusCode: 400,
                message: "provide a valid id to update the record"
            })
        }

    } catch (err) {
        logger.log({
            level:"error",
            message:"Error in the edit users" + err
        })
        next(err)
    }
}

const changepassword = async (req, res, next) => {
    const { _id, password, newpassword } = req.body;
    try {
        logger.log({
            level:"info",
            message:"To change the users password in ChangePassword"
        })
        if (_id && _id !== undefined) {
            var id = mongoose.Types.ObjectId(_id);
            const users = await userModel.findOne({ _id: id });
            const uEmail = users.email
            if (users) {
                const isPasswordMatch = await bcrypt.compare(password, users.password)
                if (isPasswordMatch) {
                    const pwd = newpassword
                    const saltRounds = 10;
                    const salt = await bcrypt.genSalt(saltRounds)
                   
                    const hasedPassword = await bcrypt.hash(pwd, salt)
                    await userModel.updateOne({
                        _id: id,
                    }, {
                        $set: {
                            password: hasedPassword
                        }
                    })
                    res.json({
                        statusCode: 200,
                        message: `User password Changed successfully`
                    })
                }
                res.json({
                    statusCode: 400,
                    message: "Given password is not matching"
                })
            }
            res.json({
                statusCode: 400,
                message: "User doesn't exsist"
            })
        } else {
            res.json({
                statusCode: 400,
                message: "Provide a valid id to update the record"
            })
        }

    } catch (err) {
        logger.log({
            level:"error",
            message:"Error in the ChangePassword to the user" + err
        })
        next(err)
    }
}





const deleteUser = async (req, res, next) => {
    let _id = req.params.ID;
    try {
        logger.log({
            level:"info",
            message:"To delete the user based on particular user id"
        })
        if (_id) {
            var id = mongoose.Types.ObjectId(_id);
            const user = await userModel.findOne({ _id: id })
            const authHeader = req.headers.authorization;
            const token1 = authHeader.split(' ')[1];
            const payload = jwt.verify(token1, process.env.SECRET_KEY)
            const iD = mongoose.Types.ObjectId(payload._id);
            const userData = await userModel.findOne({ _id: iD });
            const { fireBaseToken,fname,lname } = userData || {}
            if (user) {
                await userModel.deleteOne({ _id: id })
                const message = {
                    notification: {
                        title: "rbac notification",
                        body: "user removed successfully",
                    },
                };
                const data = await userModel.findOne({ _id: id })
                if (!data) {
                    if (fireBaseToken && fireBaseToken.length) {
                        pushMsg.notify(fireBaseToken, message)
                            .then(async(response) => {
                                await notification.insertMany({
                                    createdBy: fname + '' + lname,
                                    message: message
                                })
                                console.log(response)
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    }
                    res.json({
                        statusCode: 200,
                        message: 'removed the user successfully',
                    })
                }
            } else {
                res.json({
                    statusCode: 400,
                    message: "no record matching the provided id"
                })
            }

        } else {
            res.json({
                statusCode: 400,
                message: "provide a valid id to delete the record"
            })
        }
    } catch (err) {
        logger.log({
            level:"error",
            message:"Error in the removing user in Delete api" + err
        })
        next(err)
    }
}

const logout = (req, res, next) => {
    try {
        logger.log({
            level:"info",
            message:'To Logout the user in the application'
        })
        const token1 = req.cookies.access_token;
        //used when parsing the JWT to verify that it hasn’t been compromised by an authorized party
        const user = jwt.verify(token1, process.env.SECRET_KEY)
       
        req.token = token1;
        req.role = user.role;
        return res
            .clearCookie("access_token")
            .status(200)
            .json({ message: "Successfully logged out 😏 🍀" });

    } catch (error) {
        logger.log({
            level:"error",
            message:"Error in the logout user" + error
        })
        next(error)
    }
}

const fireBaseToken = async (req, res, next) => {
    const { fireBaseToken } = req.body;
    const authHeader = req.headers.authorization;
    const token1 = authHeader.split(' ')[1];
    if (token1) {
        const payload = jwt.verify(token1, process.env.SECRET_KEY)
        const id = payload._id
        var iD = mongoose.Types.ObjectId(id);
        if (fireBaseToken) {
            await userModel.updateOne({
                _id: iD,
            }, {
                $set: {
                    fireBaseToken: fireBaseToken
                }
            })
            res.json({
                statusCode: 200,
                message: "updated the firebase token successfully"
            })
        } else {
            res.json({
                statusCode: 400,
                message: "provide the valid fireBaseToken to update"
            })
        }

    } else {
        res.status(401).json({
            statusCode: 401,
            message: 'authorization token not found',
        })
    }
}

const getNotifications = async(req,res,next)=>{
    const { pageno, pagesize,stype, sdir } = req.query;
    try {
        logger.log({
            level:"info",
            message:"To get the notifactions "
        })
        const pageSize = parseInt(pagesize)
        if (pageno && pageSize) {
            if (pageno == 0 || pageSize == 0) {
                res.json(
                    {
                        statuScode: 400,
                        message: "pageno and pagesize cannot be zero"
                    }
                )
            }
        } else {
            res.json({
                statusCode: 400,
                message: "pageno and pagesize is mandatory"
            })
        }
        const sort = () => {
            if (stype && sdir) {
                const sDir = parseInt(sdir)
                const sortObj = {};
                sortObj[stype] = sDir
                return sortObj
            } else {
                return { _id : 1 }
            }

        }
        const sorted = sort();
        const listOfNotifications = await notification.aggregate([{ $sort: sorted }, { $skip: (pageno - 1) * pageSize }, { $limit: pageSize * 1 }])
        if (!listOfNotifications) {
            res.json({
                statusCode: 200,
                message: "no records matching the input",
            })
        } else {
            res.json({
                statusCode: 200,
                message: "listed the users successfully",
                data: listOfNotifications,
                currentPage: pageno
            })
        }
    } catch (error) {
        logger.log({
            level:"error",
            message:"Error in Getting the notifications" + error
        })
        next(error)
    }
}

module.exports = {
    addUser,
    login,
    getUsers,
    editUser,
    deleteUser,
    logout,
    fireBaseToken,
    changepassword,
    uploadProfileImg,
    getProfile,
    getNotifications
}

const project = require('../models/project.model');
const pushMsg = require('../notifications');
const userModel = require('../models/users');
const notification = require('../models/notifiactions.model')
const jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
const logger = require("../utils/winston")

const getProjects = async (req, res, next) => {
    const { pageno, pagesize, clientName, projectName, sdir, stype } = req.query;
    const Value_match = new RegExp(projectName);
    const pageSize = parseInt(pagesize);
    try {
        logger.log({
            level:"info",
            message:"To get the projects"
        })
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
        const getMatch = () => {
            if (projectName && clientName) {
                return [{ "clientName": clientName, "projectName": { $regex: Value_match, $options: 'i' } }]
            } else {
                if (projectName) {
                    return [{ "projectName": { $regex: Value_match, $options: 'i' } }]
                } else if (clientName) {
                    return [{ "clientName": clientName }]
                } else {
                    return [{}];
                }
            }
        }
        const $or = getMatch();

        const sort = () => {
            if (stype && sdir) {
                const sDir = parseInt(sdir)
                const sortObj = {};
                sortObj[stype] = sDir
                return sortObj
            } else {
                return { projectName: 1 }
            }

        }
        const sorted = sort();
        const count2 = await project.find({ $or }).count();
        const projects = await project.aggregate([{ $match: { $or } },{ $sort: sorted }, { $skip: (pageno - 1) * pageSize }, { $limit: pageSize * 1 }]);
        if (count2 == 0) {
            res.json({
                statusCode: 400,
                message: "no records matching the given input"
            })
        } else {
            res.json({
                statusCode: 200,
                message: "successfully fetched the list of projects",
                data: projects,
                totalRecords: count2,
                currentPage: pageno
            })
        }
    } catch (err) {
        logger.log({
            level:'error',
            message:"Error in getting project" + err
        })
        next(err)
    }
};

const addProject = async (req, res, next) => {
    let { projectName, projectDescription, clientName, technologies, duration } = req.body;
    try {
        logger.log({
            level:"info",
            message:"Adding the projects"
        })
        if (projectName, clientName, duration, projectDescription, technologies) {
            const authHeader = req.headers.authorization;
            const token1 = authHeader.split(' ')[1];
            const { _id } = jwt.verify(token1, process.env.SECRET_KEY)
            var iD = mongoose.Types.ObjectId(_id);
            const user = await userModel.findOne({ _id: iD });
            const { fireBaseToken, fname, lname } = user || {}
            await project.insertMany([{
                projectName,
                projectDescription,
                clientName,
                technologies,
                duration
            }])
            const message = {
                notification: {
                    title: "rbac notification",
                    body: `project added successfully by ${fname}`,
                },
            };
            if (fireBaseToken && fireBaseToken.length) {
                pushMsg.notify(fireBaseToken, message)
                    .then(async (response) => {
                        await notification.insertMany({
                            createdBy: fname + '' + lname,
                            message: message
                        })
                        res.json({
                            statusCode: 200,
                            result: "project added Successfully",
                            response: message
                        })
                    })
                    .catch((error) => {
                        console.log(error);
                    });
            } else {
                res.json({
                    statusCode: 200,
                    message: 'project added successfully'
                })
            }
        } else {
            res.json({
                statusCode: 400,
                message: "projectName,clientName,duration,projectDescription,technologies are mandatory"
            })
        }
    } catch (err) {
        logger.log({
            level:"error",
            message:"Error in the add projects" + err
        })
        next(err)
    }
}

const editProject = async (req, res, next) => {
    const { _id, projectName, clientName, duration, projectDescription, technologies } = req.body;
    try {
        logger.log({
            level:"info",
            message:"Edit The project based on particular ID"
        })
        if (_id) {
            const authHeader = req.headers.authorization;
            const token1 = authHeader.split(' ')[1];
            const payload = jwt.verify(token1, process.env.SECRET_KEY)
            const userId = payload._id
           const iD = mongoose.Types.ObjectId(userId);
            const user = await userModel.findOne({ _id: iD });
            const { fireBaseToken,fname, lname } = user || {}
            var id = mongoose.Types.ObjectId(_id);
            const projectData = await project.findOne({ _id: id})
            if(projectData){
                await project.updateOne({
                    _id: id,
                }, {
                    $set: {
                        projectName, clientName, duration, projectDescription, technologies
                    }
                })
                const message = {
                    notification: {
                        title: "rbac notification",
                        body: `Project with id ${id} has been updated successfully`,
                    },
                };
                if (fireBaseToken && fireBaseToken.length) {
                    pushMsg.notify(fireBaseToken, message)
                        .then(async(response) => {
                            await notification.insertMany({
                                createdBy: fname + '' + lname,
                                message: message
                            })
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
                res.json({
                    statusCode: 200,
                    message: ` project with id ${_id} updated successfully`,
                })
            }else{
                res.json({
                    statusCode: 400,
                    message: "no project with this id to update"
                })
            }    
        } else {
            res.json({
                statusCode: 400,
                message: "provide valid id to update the project"
            })
        }
    } catch (err) {
        logger.log({
            level:"error",
            message:"Error in the Edit project" + err
        })
        next(err)
    }
}

const deleteProject = async (req, res, next) => {
    const  _id = req.params.ID;
    try {
        logger.log({
            level:"info",
            message:"this is the Delete project Based on particular project id"
        })
        if (_id) {
           const id = mongoose.Types.ObjectId(_id);
            const authHeader = req.headers.authorization;
            const token1 = authHeader.split(' ')[1];
            const payload = jwt.verify(token1, process.env.SECRET_KEY)
            const userId = payload._id
           const iD = mongoose.Types.ObjectId(userId);
            const user = await userModel.findOne({ _id: iD });
            const { fireBaseToken,fname, lname } = user || {}
            const projects = await project.findOne({ _id: id })
            if (projects) {
                await project.deleteOne({
                    _id: id
                })
                const data = await project.findOne({ _id: id })
                if (!data) {
                    const message = {
                        notification: {
                            title: "rbac notification",
                            body: `Project with id ${id} has been removed successfully`,
                        },
                    };
                    if (fireBaseToken && fireBaseToken.length) {
                        pushMsg.notify(fireBaseToken, message)
                            .then(async(response) => {
                                await notification.insertMany({
                                    createdBy: fname + '' + lname,
                                    message: message
                                })
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    }
                    res.json({
                        statusCode: 200,
                        message: 'project deleted successfully',

                    })
                }
            } else {
                res.json({
                    statusCode: 400,
                    message: "No record matching the given Id"
                })
            }
        } else {
            res.json({
                statusCode: 400,
                message: "provide valid id to delete the project"
            })
        }
    } catch (err) {
        logger.log({
            level:"error",
            message:"Error in the Deleting the project" + err
        })
        next(err)
    }
}

module.exports = {
    getProjects,
    addProject,
    editProject,
    deleteProject
}
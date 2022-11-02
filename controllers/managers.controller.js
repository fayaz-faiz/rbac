const manager = require('../models/managers');
const userModel = require('../models/users');
const pushMsg = require('../notifications');
const mongoose = require('mongoose');
const projectAssignedModel = require("../models/AssignProject")
const logger = require('../utils/winston')


//const registrationToken=['c6e-JEm5mpPXRE6dydqvXZ:APA91bEU2GQ-fnSqKPaPCzNsP0kuB33Zg7DBr8KFQwXmGZe36MtUdoV1oL-MWLlGyvlwZ7Y1yHkeytVkjknDcG1j-bGaogHiTa0A7P3f8711Gq9cUve8WgnvPU5ibjdZJx5vbStl8Gdf']

const getAllManagers = async (req, res, next) => {
    const { pageno, pagesize, department, regex, stype, sdir } = req.query;
    const Value_match = new RegExp(regex);
    const pageSize = parseInt(pagesize);
    try {
        logger.log({
            level: "info",
            message: "To get all the Manager List"
        })
        if (pageno && pagesize) {
            if (pageno == 0 || pagesize == 0) {
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
            if (regex && department) {
                return [{ "department": department, "managerName": { $regex: Value_match, $options: 'i' } }]
            } else {
                if (regex) {
                    return [{ "managerName": { $regex: Value_match, $options: 'i' } }]
                } else if (department) {
                    return [{ "department": department }]
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
                return { managerName: 1 }
            }
        }
        const sorted = sort();
        const managers = await manager.aggregate([{ $match: { $or } }, { $sort: sorted }, { $skip: (pageno - 1) * pageSize }, { $limit: pageSize * 1 }])
        const count2 = await manager.find({ $or }).count();
        if (count2 == 0) {
            res.json({
                statusCode: 400,
                message: "no records matching the input"
            })
        } else {
            res.json({
                statusCode: 200,
                message: "Successfully fetched the list of all the managers",
                data: managers,
                totalRecords: count2,
                currentpageno: pageno
            });
        }
    } catch (err) {
        logger.log({
            level: 'error',
            message: "Error in the getting All Manngers list" + err
        })
        next(err)
    }
};

const editManager = async (req, res, next) => {
    const { _id, managerName, department } = req.body;
    try {
        logger.log({
            level: 'info',
            message: "Editing To the particular Manager"
        })
        if (_id) {
            var id = mongoose.Types.ObjectId(_id);
            await manager.updateOne({
                _id: id,
            }, {
                $set: {
                    managerName,
                    department
                }
            })
            res.json({
                statusCode: 200,
                message: `manager with id ${_id} has been updated successfully`,
            })
        } else {
            res.json({
                statusCode: 400,
                message: "provide a valid ID to update the record"
            })

        }

    } catch (err) {
        logger.log({
            level: "error",
            message: "Error in the edit Manager" + err
        })
        next(err)
    }
}
const deleteManager = async (req, res, next) => {
    let _id  = req.params.ID;
    try {
        logger.log({
            level: "info",
            message: "To Delete The particular Manager"
        })
        if (_id) {
            var id = mongoose.Types.ObjectId(_id);
            const nManager = await manager.findOne({ _id: id })
            const email = nManager.email
            const user = await userModel.findOne({ email: email })
            const { fireBaseToken } = user || {}
            if (user && nManager) {
                const message = {
                    notification: {
                        title: "rbac notification",
                        body: `Manager with id ${id} has been removed successfully`,
                    },
                }
                await manager.deleteOne({
                    _id: id
                })
                await userModel.deleteOne({ email: email })
                const data = await manager.findOne({ _id: id })
                if (!data) {
                    if (fireBaseToken && fireBaseToken.length) {
                        pushMsg.notify(fireBaseToken, message)
                            .then((response) => {
                                console.log(response)
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    }
                    res.json({
                        statusCode: 200,
                        message: "manager removed successfully"
                    })
                }
            } else {
                res.json({
                    statusCode: 400,
                    message: "no record matching the given id"
                })
            }
        } else {
            res.json({
                statusCode: 400,
                message: "provide valid Id to delete the record"
            })
        }
    } catch (err) {
        logger({
            level: "error",
            message: "error in the Deleting Manager" + err
        })
        next(err)
    }

}

const AssignedProjects = async (req, res, next) => {
    const { managerId, projectId } = req.body;
    const managerID = mongoose.Types.ObjectId(managerId);
    try {
        logger.log({
            level: "info",
            message: "Assgin the poject to Manager"
        })
        if (managerId && projectId) {
            const data = await projectAssignedModel.findOne({ userId: managerID })
            if (data) {
                const iD = data.projectId
                if (projectId == iD) {
                    res.json({
                        statusCode: 400,
                        message: "same project has been already assigned to this manager"
                    })
                }
            } else {
                const { email } = await manager.findOne({ _id: managerID })
                const { _id } = await userModel.findOne({ email: email })
                await projectAssignedModel.insertMany({
                    userId: _id,
                    projectId: projectId
                })
                res.json({
                    statusCode: 200,
                    result: `manager with Id ${managerID} has been assigned the project`
                })
            }
        } else {
            res.json({
                statusCode: 400,
                result: `manager id and project id are mandatory`
            })
        }
    } catch (error) {
        logger.log({
            level: "error",
            message: "Error in the assigning project to Manager" + error
        })
        next(error)
    }
}

const listOfProjects = async (req, res, next) => {
    const { userId } = req.params
    const { pageno, pagesize, stype, sdir } = req.query;
    try {
        logger.log({
            level: "info",
            message: "To get the list of projects"
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
                return { _id: 1 }
            }

        }
        const sorted = sort()
        if (userId) {
            const id = mongoose.Types.ObjectId(userId)
            const projectsMatchingUserId = await projectAssignedModel.aggregate([
                {
                    $match:{ userId: id }
                },
                { $sort: sorted }, { $skip: (pageno - 1) * pageSize }, { $limit: pageSize * 1 },
                {
                    $lookup: {
                        from: "projects",
                        localField: "projectId",
                        foreignField: "_id",
                        as: "projects"
                    }
                }
            ]);
            if (projectsMatchingUserId) {
                res.json({
                    statuScode: 200,
                    message: "fetched the details successfully",
                    result: projectsMatchingUserId,
                    currentPage: pageno
                })
            } else {
                res.json({
                    statuScode: 400,
                    message: "no projects assigned to the user id"
                })
            }

        } else {
            res.json({
                statusCode: 400,
                message: "provide the valid user id"
            })
        }
    } catch (err) {
        logger.log({
            info: "error",
            message: "Error in the list of projects" + err
        })
        next(err)
    }
}


module.exports = {
    getAllManagers,
    editManager,
    deleteManager,
    AssignedProjects,
    listOfProjects
}
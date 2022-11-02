const lead = require('../models/teamLead')
const userModel = require('../models/users')
const pushMsg = require('../notifications');
var mongoose = require('mongoose');
const projectAssignedModel = require('../models/AssignProject')
const logger = require('../utils/winston');
const jwt = require('jsonwebtoken');
const notification = require('../models/notifiactions.model')

//const registrationToken = ['c6e-JEm5mpPXRE6dydqvXZ:APA91bEU2GQ-fnSqKPaPCzNsP0kuB33Zg7DBr8KFQwXmGZe36MtUdoV1oL-MWLlGyvlwZ7Y1yHkeytVkjknDcG1j-bGaogHiTa0A7P3f8711Gq9cUve8WgnvPU5ibjdZJx5vbStl8Gdf']

const getTeamLeadList = async (req, res, next) => {
    const { pageno, pagesize, department, regex, stype, sdir } = req.query;
    const Value_match = new RegExp(regex);
    const pageSize = parseInt(pagesize)

    try {
        logger.log({
            level:"info",
            message:'To get the list of Team leads'
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
            if (regex && department) {
                return [{ "department": department, "leadName": { $regex: Value_match, $options: 'i' } }]
            } else {
                if (regex) {
                    return [{ "leadName": { $regex: Value_match, $options: 'i' } }]
                }
                else if (department) {
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
                return { leadName: 1 }
            }

        }
        const sorted = sort();

        const count = await lead.countDocuments();
       
        const leads = await lead.aggregate([{ $match: { $or } }, { $sort: sorted }, { $limit: pageSize }, { $skip: (pageno - 1) * pageSize }])
        const count2 = await lead.find({ $or }).count();
        if (count2 == 0) {
            res.json({
                statusCode: 400,
                message: "no records matching the given input"
            })
        } else {
            res.json({
                statusCode: 200,
                message: "successfully fetched the list of team leads",
                data: leads,
                totalRecords: count2,
                currentpage: pageno
            })
        }

    } catch (err) {
        logger.log({
            level:"error",
            message:"Error in the Getting TeamLeads"  + err
        })
        next(err)
    }
}

const updateTeamLead = async (req, res, next) => {
    const { _id, leadName, manager, department } = req.body;
    try {
        logger.log({
            level:"info",
            message:"to Update the TeamLead"
        })
        if (_id) {
            var id = mongoose.Types.ObjectId(_id);
            await lead.updateOne({
                _id: id,
            }, {
                $set: {
                    leadName,
                    manager,
                    department
                }
            });
            res.json({
                statusCode: 200,
                message: `successfully updated the teamLead data with id ${_id}`,
            });
        } else {
            res.json({
                statusCode: 400,
                message: "provide a valid id to update the record"
            })
        }

    } catch (error) {
        logger.log({
            level:"error",
            message:"Error in Updating the TeamLead" + error
        })
        next(error)
    }
}

const removeLead = async (req, res, next) => {
    const  _id  = req.params.ID;
    try {
        logger.log({
            level:"info",
            message:"To Remove the TeamLead based on ID"
        })
        if (_id) {
            var id = mongoose.Types.ObjectId(_id);
            const nLead = await lead.findOne({ _id: id });
            const email = nLead.email;
            const user = await userModel.findOne({ email: email });
            const  token1 = req.headers.authorization.split(' ')[1];
            const payload = jwt.verify(token1, process.env.SECRET_KEY)
            const iD = mongoose.Types.ObjectId(payload._id);
            const userData = await userModel.findOne({ _id: iD });
            const { fireBaseToken,fname,lname } = userData || {}
            if (user && nLead) {
                await lead.deleteOne({
                    _id: id
                });
                await userModel.deleteOne({ email: email });
                const data = await lead.findOne({ _id: id })
                if (!data) {
                    const message = {
                        notification: {
                            title: "rbac notification",
                            body: `Team Lead with id ${id} has been removed successfully`,
                        },
                    };
                    if (fireBaseToken && fireBaseToken.length) {
                        pushMsg.notify(fireBaseToken, message)
                            .then(async(response) => {
                                console.log(response)
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
                        message: "successfully removed the team lead from the list"
                    })
                }

            } else {
                res.json({
                    statusCode: 400,
                    message: "no records matching the given id"
                })
            }
        } else {
            res.json({
                statusCode: 400,
                message: "provide a valid Id to remove a record from the list"
            })
        }


    } catch (err) {
        logger.log({
            level:"error",
            message:"Error in the Removing of TeamLead" + err
        })
        next(err)
    }
}


const AssignedProjectsToLead = async (req, res, next) => {
    const { teamleadId, projectId } = req.body;
    const teamleadID = mongoose.Types.ObjectId(teamleadId);
    const projectID = mongoose.Types.ObjectId(projectId);
    try {
        logger.log({
            level:"info",
            message:'Assinged Projects To The Teamlead'
        })
        if (teamleadId && projectId) {
            const data = await projectAssignedModel.findOne({ userId: teamleadID })
            if(data){
                const iD = data.projectId
                if (projectId == iD) {
                    res.json({
                        statusCode: 400,
                        message: "same project has been already assigned to this team lead"
                    })
                }
            }else{
                const { email } = await lead.findOne({ _id: teamleadID })
                const { _id } = await userModel.findOne({ email: email })
                await projectAssignedModel.insertMany({
                    userId:_id ,
                    projectId: projectID
                })
                res.json({
                    statusCode: 200,
                    result: `teamLead with Id ${teamleadID} has been assigned the project`
                })
            }
            
        } else {
            res.json({
                statusCode: 400,
                result: `TeamLead id and project id are manadatory`
            })
        }
    } catch (error) {
        logger.log({
            level:"error",
            message:"Error in Assinged Projects To The Teamlead" + error
        })
        next(error)
    }
}

module.exports = {
    getTeamLeadList,
    updateTeamLead,
    removeLead,
    AssignedProjectsToLead
}
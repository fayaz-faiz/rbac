const teamMember = require('../models/teamMember');
const pushMsg = require('../notifications');
const userModel = require('../models/users');
const projectAssignedModel = require('../models/AssignProject')
var mongoose = require('mongoose');
const logger  = require('../utils/winston')
const jwt = require('jsonwebtoken');
const notification = require('../models/notifiactions.model')

const getAllTeamMembers = async (req, res, next) => {
    const { pageno, pagesize, department, teamLead, manager, regex, stype, sdir } = req.query;
    const Value_match = new RegExp(regex);
    const pageSize = parseInt(pagesize);
    const sDir = parseInt(sdir)
    const sortObj = {};
    sortObj[stype] = sDir
    try {
        logger.log({
            level:"info",
            message:"To get the list of all Team Memebers"
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
            if (regex && department && teamLead && manager) {
                return [{ "teamLead": teamLead, "department": department, "manager": manager, "teamMember": { $regex: Value_match, $options: 'i' } }]
            } else {
                if (department) {
                    return [{ "teamMember": { $regex: Value_match, $options: 'i' } }]
                } else if (teamLead) {
                    return [{ "teamLead": teamLead }]
                } else if (manager) {
                    return [{ "manager": manager }]
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
                return { teamLead: 1 }
            }

        }
        const sorted = sort();
        const members = await teamMember.aggregate([{ $match: { $or } }, { $sort: sorted }, { $skip: (pageno - 1) * pageSize }, { $limit: pageSize * 1 }])
        const count2 = await teamMember.find({ $or }).count();
        if (count2 == 0) {
            res.json({
                statuscode: 400,
                message: "no records matching the given input"
            })
        } else {
            res.json({
                statusCode: 200,
                message: "succesfully fetched the list of team members",
                totalRecords: count2,
                currentPage: pageno,
                data: members
            })
        }

    } catch (err) {
        logger.log({
            level:"error",
            message:"Error in the geting all the team Members" + err
        })
        next(err)
    }
};



const editTeamMember = async (req, res, next) => {
    const { _id, memberName, managerName, teamLeadName, department } = req.body;

    try {
        logger.log({
            level:"info",
            message:'To edit the Team  Member'
        })
        if (_id) {
            var id = mongoose.Types.ObjectId(_id);
            await teamMember.updateOne({
                _id: id,
            }, {
                $set: {
                    memberName,
                    teamLeadName,
                    managerName,
                    department
                }
            })
            res.json({
                statusCode: 200,
                message: `team member with _id ${_id} details updated successfully`,
            })
        } else {
            res.json({
                statusCode: 400,
                message: "provide a valid ID to update the user"
            })
        }

    } catch (err) {
        logger.log({
            level:"error",
            message:"Error in Editing the Team Member in Edit" + err
        })
        next(err)
    }
}

const removeTeamMember = async (req, res, next) => {
    let  _id = req.params.ID;
    try {
        logger.log({
            level:"info",
            message:"To Remove the Team Member based on the TeamMember id"
        })
        if (_id) {
            var id = mongoose.Types.ObjectId(_id);
            console.log(id)
            const teamUser = await teamMember.findOne({ _id: id });
            console.log(teamUser)
            const {email} = teamUser || {}
            const user = await userModel.findOne({ email:email})
            const  token1 = req.headers.authorization.split(' ')[1];
            const payload = jwt.verify(token1, process.env.SECRET_KEY)
            const iD = mongoose.Types.ObjectId(payload._id);
            const userData = await userModel.findOne({ _id: iD });
            const { fireBaseToken,fname,lname } = userData || {}
            if(user && teamUser){
                await teamMember.deleteOne({
                    _id: id
                })
                await userModel.deleteOne({ email: email })
                const data = await teamMember.findOne({ _id: id })
                if (!data) {
                    const message = {
                        notification: {
                            title: "rbac notification",
                            body: `Team Member with id ${id} has been removed successfully`,
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
                        message: 'removed the team member successfully',
                    })
                }
            }else{
                res.json({
                    statusCode:400,
                    message:"no records matching the given ID"
                })
            }
            
        }else{
            res.json({
                statusCode:400,
                message:"provide a valid ID to delete the user"
            })
        }

    } catch (err) {
        logger.log({
            level:"error",
            message:"Error in the removing of team member" + err
        })
        next(err)
    }
}

const AssignedProjectsToTeamMember = async (req, res, next) => {
    const { teamMemberId, projectId } = req.body;
    const teamMemberID = mongoose.Types.ObjectId(teamMemberId);
    const projectID = mongoose.Types.ObjectId(projectId);
    try {
        logger.log({
            level:"info",
            message:'To assinged project to team member'
        })
        if (teamMemberId && projectId) {

            const data = await projectAssignedModel.findOne({ userId:teamMemberID })
            if(data){
                const iD = data.projectId
                if (projectId == iD) {
                    res.json({
                        statusCode: 400,
                        message: "same project has been already assigned to this team member"
                    })
                }
            }else{
                const { email } = await teamMember.findOne({ _id: teamMemberID })
                const { _id } = await userModel.findOne({ email: email })
                await projectAssignedModel.insertMany({
                    userId: _id,
                    projectId: projectID
                })
                res.json({
                    statusCode: 200,
                    result: `team member with Id ${teamMemberID} has been assigned the project`
                })
            }
            
        } else {
            res.json({
                statusCode: 400,
                result: `team Member id and project id are mandatory`
            })
        }
    } catch (error) {
        logger.log({
            level:"error",
            message:"Error in assinged project to team member" + error
        })
        next(error)
    }
}


module.exports = {
    getAllTeamMembers,
    editTeamMember,
    removeTeamMember,
    AssignedProjectsToTeamMember

}
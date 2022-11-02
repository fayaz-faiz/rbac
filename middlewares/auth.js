const jwt = require('jsonwebtoken');
const role = require('../models/roles');
const userModel = require('../models/users')

const authorizeAll = async (req, res, next) => {
    if (req.headers['authorization']) {
        const token = req.headers['authorization'].split(" ")[1]
        if (token) {
            const payload = jwt.verify(token, process.env.SECRET_KEY)
            req.token = token
            req.role = payload.role;
            if (payload.role == 1 || payload.role == 2 || payload.role == 3 || payload.role == 4) {
                next()
            } else {
                res.json({
                    statusCode: 401,
                    message: 'Not authorized',

                })
            }
        } else {
            res.json({
                statusCode: 401,
                message: 'token expired',
            })
        }
    } else {
        res.json({
            statusCode: 401,
            message: 'Not authorized',

        })
    }
}

const authorizeAdminManagerTl = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token1 = authHeader.split(' ')[1];
    if (token1) {
        const payload = jwt.verify(token1, process.env.SECRET_KEY, (err) => {
            if (err) {
                err = {
                    name: 'TokenExpiredError',
                    message: 'jwt expired',
                    expiredAt: "10h"
                }
                res.json({
                    statusCode: 500,
                    message: err
                })
            } else {
                req.token = token1;
                req.role = payload.role;

                if (payload.role == 1 || payload.role == 2 || payload.role == 3) {
                    next()
                } else {
                    res.json({
                        statusCode: 401,
                        message: 'Not authorized',

                    })
                }
            }
        })
    } else {
        res.json({
            statusCode: 401,
            message: 'token expired',
        })
    }
}

const authorizeUserAdminManager = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token1 = authHeader.split(' ')[1];
    if (token1) {
        const payload = jwt.verify(token1, process.env.SECRET_KEY)
        req.token = token1;
        req.role = payload.role;
        if (payload.role == 1 || payload.role == 2) {
            next()
        } else {
            res.json({
                statusCode: 401,
                message: 'Not authorized'

            })
        }
    } else {
        res.json({
            statusCode: 401,
            message: 'token expired',
        })
    }
}


const authorizeAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    try{
        const token1 = authHeader.split(' ')[1];
        if (token1) {
            const payload = jwt.verify(token1, process.env.SECRET_KEY)
            req.token = token1;
            req.role = payload.role;
            if (payload.role == 1) {
                next()
            } else {
                res.json({
                    statusCode: 401,
                    message: 'Not authorized',
                })
            }
        } else {
            res.json({
                statusCode: 401,
                message: 'token expired',
            })
        }
    }catch(err){
        next(err)
    }
}

const authorizeManager = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token1 = authHeader.split(' ')[1];
    if (token1) {
        const payload = jwt.verify(token1, process.env.SECRET_KEY)
        req.token = token1;
        req.role = payload.role;

        if (payload.role ==  2) {
            next()
        } else {
            res.json({
                statusCode: 401,
                message: 'Not authorized',
            })
        }
    } else {
        res.json({
            statusCode: 401,
            message: 'token expired',
        })
    }
}

const authorizeTeamLead = (req, res, next) => {

    const authHeader = req.headers.authorization;
    const token1 = authHeader.split(' ')[1];
    if (token1) {
        const payload = jwt.verify(token1, process.env.SECRET_KEY)
        req.token = token1;
        req.role = payload.role;
        if (payload.role == 3) {
            next()
        } else {
            res.json({
                statusCode: 401,
                message: 'Not authorized',

            })
        }
    } else {
        res.json({
            statusCode: 401,
            message: 'token expired',
        })
    }
}

const authorizeTeamMember = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token1 = authHeader.split(' ')[1];
    if (token1) {
        const payload = jwt.verify(token1, process.env.SECRET_KEY)
        req.token = token1
        req.role = payload.role;
        if (payload.role == 4) {
            next()
        } else {
            res.json({
                statusCode: 401,
                message: 'Not authorized',
            })
        }
    } else {
        res.json({
            statusCode: 401,
            message: 'token expired',
        })
    }

}

module.exports = {
    authorizeAll,
    authorizeAdminManagerTl,
    authorizeUserAdminManager,
    authorizeAdmin,
    authorizeTeamMember,
    authorizeTeamLead,
    authorizeManager,
}
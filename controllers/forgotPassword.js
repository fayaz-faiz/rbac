const user = require('../models/users')
const sendEmail = require("../utils/nodeMailer")
const randomstring = require('randomstring')
const logger = require('../utils/winston')
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose')

const forgotPassword = async (req, res, next) => {
    const { email } = req.body
    try {
        logger.log({
            level: 'info',
            message: "reset password on forgot password"
        })

        if (email) {
            const userData = await user.findOne({ email: email });
            if (userData) {
                const { _id } = userData
                await sendEmail(email, "Password Change", "reseting the password")
                res.json({
                    statusCode: 200,
                    userId: _id,
                    message: "Check your email inbox  and reset your password"
                })
            } else {
                res.json({
                    statusCode: 400,
                    message: "This email does not exists..."
                })
            }
        } else {
            res.json({
                statusCode: 400,
                message: "provide a valid email Id"
            })
        }
    } catch (err) {
        logger.log({
            level: "error",
            message: "error occured while reseting the password on forgot password" + err
        })
        next(err)
    }
}

const changeForgotPassword = async (req, res, next) => {
    const {userId , newPassword } = req.body
    try {
        logger.log({
            level: 'info',
            message: "reseting the password on forgot password "
        })
        if (userId) {
            var id = mongoose.Types.ObjectId(userId);
                const salt = await bcrypt.genSalt(10)
                const hasedPassword = await bcrypt.hash(newPassword, salt)
                await user.updateOne({
                    _id: id,
                }, {
                    $set: {
                        password: hasedPassword
                    }
                })
                res.json({
                    statusCode: 200,
                    message: "User password Changed successfully"
                })
            
        } else {
            res.json({
                statusCode: 400,
                message: "Provide a valid email to update the record"
            })
        }

    } catch (err) {
        logger.log({
            level: 'error',
            message: 'error on reseting the password on forgot password' + err
        })
        next(err)
    }
}

module.exports = {
    forgotPassword,
    changeForgotPassword
}
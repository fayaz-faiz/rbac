const logoModel = require('../models/logo.model');
const logger = require('../utils/winston')
const addLogo = async (req, res, next) => {
    const { projectLogo, projectTitle } = req.body
    try {
        logger.log({
            level:'info',
            message:"To add the Logo"
        })
        await logoModel.insertMany({
            projectLogo,
            projectTitle
        })
        res.json({
            statusCode: 200,
            result: "logo added successfully"
        })
    } catch (error) {
        logger.log({
            level:"error",
            message:"Error on adding the logo in project" + error
        })
        next(error)
    }
}


const getLogo = async (req, res, next) => {
    try {
        logger.log({
            level:"info",
            message:"To get the logo of the project "
        })
        const logoDetails = await logoModel.find({});
        if (logoDetails) {
            res.json({
                statusCode: "200",
                result: logoDetails
            })
        } else {
            res.json({
                statuscode: 400,
                result: "no records to display"
            })
        }

    } catch (error) {
        logger.log({
            level:"info",
            message:"Error in the getting logo of the project" + error
        })
        next(error)
    }
}
module.exports = {
    addLogo,
    getLogo,
}
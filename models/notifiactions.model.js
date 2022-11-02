const mongoose = require( 'mongoose' );

const notificationSchema = new mongoose.Schema( {
        createdBy:{
            type:String
        },
        message:{
            type:Object
        },
        createdAt:{
            type:Date,
            default:Date.now()
        }
} );

module.exports = mongoose.model('notification',notificationSchema)
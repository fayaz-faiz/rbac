const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    _id:{
        type:Number
    },
    rolePermission:{
        type:String
    }
})

module.exports = mongoose.model('permissions',permissionSchema)
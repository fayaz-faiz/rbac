const mongoose = require('mongoose');

const rolePermissionSchema = new mongoose.Schema({
    _id:{
        type:Number
    },
    roleName: {
        type: String
    }, 
    permissions: {
        type: [Number]
    }
})

module.exports = mongoose.model('rolepermissions',rolePermissionSchema);

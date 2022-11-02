const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
    memberName:{
        type:String,
        
    },
    email:{
        type:String
    },
    department:{
        type:String,
       
    },
    role:{
        type:Number
    },
     date:{
        type:Date,
        default:Date.now()
     }

})

module.exports = mongoose.model('member',memberSchema)
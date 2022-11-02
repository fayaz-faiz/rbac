const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const managerSchema = new Schema({

    managerName:{
        type:String
    },
    email:{
        type:String
    },
    role:{
        type:Number
    },
    department:{
        type:String
    },
    date: {
        type: Date,
        default:Date.now()
    }
})

module.exports = mongoose.model('manager',managerSchema)
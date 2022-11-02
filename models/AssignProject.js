const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AssignedProjectSchema = new Schema({
    userId:{
      type:Schema.Types.ObjectId
    },
    projectId:{
      type:Schema.Types.ObjectId
    },
    date: {
        type: Date,
        default: Date().now
    }
});

module.exports = mongoose.model('assignedProject',AssignedProjectSchema)
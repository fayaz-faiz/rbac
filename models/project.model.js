//requiring mongoose to coonect to m
const mongoose = require('mongoose');
//to include the structure in the database
const Schema = mongoose.Schema;
//creating the structure to store data
const projectSchema = new Schema({
    projectName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
    },
    projectDescription: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
    },
    clientName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
    },
    technologies: {
        type:[String]
    },
    Duration: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now(),
    }
});
//in this first parameter is collection name and second parameter is variable which is storing the schema
module.exports = mongoose.model('projects', projectSchema)
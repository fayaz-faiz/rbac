const mongoose = require('mongoose');

const logoSchema = new mongoose.Schema({
    projectLogo: {
        type: String
    },
    projectTitle: {
        type: String,
        min: 5,
        max: 20
    },
    date: {
        type: Date,
        default: Date().now
    }
});

module.exports = mongoose.model('logo', logoSchema)
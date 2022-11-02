const mongoose = require( 'mongoose' );

const roleSchema = new mongoose.Schema( {
    _id:{
        type:Number
    },
    roleName:{
        type: String,
        required: true,
        minlength: 3,
        maxlength:100
    }

} );

module.exports = mongoose.model('roles',roleSchema)
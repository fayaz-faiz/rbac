const mongoose = require( 'mongoose' );
const url =" https://i.stack.imgur.com/34AD2.jpg"
const userSchema = new mongoose.Schema( {
    fname: {
        type: String,
        minlength: 3,
        maxlength:100,
        required:true
    },
    lname:{
        type:String,
        minlength: 1,
        maxlength:100,
        required:true
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required:true,
    },
    password: {
        type: String,
        unique:true,
        minlength: 8,
        maxlength:100,
        required:true
    },
    role: {
        type: String,
        required:true
    },
    department:{
        type:String,
        required:true
    },
    manager:{
        type:String
    },
    teamLead:{
       type:String
    },
    token:{
        type:String
    },
    date: {
        type: Date,
        default:Date.now()
    },
    fireBaseToken:{
        type:[String]
    },
    image:{
        type:String,
        default:url
    }
	
} );

module.exports = mongoose.model('users',userSchema)
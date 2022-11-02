const mongoose = require('mongoose');

const schema = mongoose.Schema;

const teamLeadSchema = new schema({
    leadName:{
        type:String,
        require:true
    },
    department:{
        type:String,
        required:true
    },
    role:{
        type:Number
    },
    email:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('leads',teamLeadSchema)
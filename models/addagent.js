const mongoose=require("mongoose")

const addagent=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    contact:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    password:{
        type:String,
    },
    location:{
        type:String,
    }

})
module.exports=mongoose.model('addagent',addagent);
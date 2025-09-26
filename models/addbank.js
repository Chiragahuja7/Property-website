const mongoose=require("mongoose")

const addbank=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    roi:{
        type:String,
        required:true
    },
    upload:{
        type:String,
        required:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    },

})
module.exports=mongoose.model('addbank',addbank);
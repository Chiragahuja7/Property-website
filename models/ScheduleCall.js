const mongoose=require("mongoose")

const scheduleCallSchema=new mongoose.Schema({
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
        type:String,
        default: () => new Date().toISOString().split('T')[0]
    },
    address:{
        type:String
    },
    message:{
        type:String
    },
    
})
module.exports=mongoose.model('ScheduleCall',scheduleCallSchema);
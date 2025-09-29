const mongoose=require("mongoose")

const leads=new mongoose.Schema({
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
    address:{
        type:String,
    },
    message:{
        type:String,
    },
    assigned:{
        type:String,
        default:"admin"
    },
    status:{
        type:String,
        default:"active",
    },
    property:{
        type:String,
    }

})
module.exports=mongoose.model('leads',leads);
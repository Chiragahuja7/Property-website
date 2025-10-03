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
        default: () => new Date().toISOString().split('T')[0]
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
    },
    type:{
        type:String,
        default:"Intrested"
    },
    location:{
        type:String,
        required:true
    }

})
module.exports=mongoose.model('leads',leads);
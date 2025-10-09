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
    },
    assignedAgent:{
        type:String,
        ref:'Agent'
    },
    leadStatus:{
        type:String,
        enum:['open', 'closed', 'lost'],
        default: 'open'
    },
    propId:{
        type:String
    }
})
module.exports=mongoose.model('leads',leads);
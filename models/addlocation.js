const mongoose=require("mongoose")

const addlocation=new mongoose.Schema({
    location:{
        type:String,
        required:true,
        unique:true
    }
})

module.exports=mongoose.model('addlocation',addlocation);
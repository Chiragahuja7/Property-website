const mongoose=require("mongoose")

const addamenities=new mongoose.Schema({
    amenities:{
        type:String,
        required:true,
        unique:true
    }
})

module.exports=mongoose.model('addamenities',addamenities);
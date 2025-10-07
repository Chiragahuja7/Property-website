const mongoose=require("mongoose")

const compare=new mongoose.Schema({
    properties:{
        type:[String],
        ref: 'addproperties' 
    }
})

module.exports=mongoose.model('compare',compare);
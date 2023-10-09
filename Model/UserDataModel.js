const mongoose = require('mongoose');

const UserNotes=new mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    phoneNumber:{type:String,required:true},
    owner:{  type: mongoose.Schema.Types.ObjectId,required:"true",ref:'User'},

}, { timestamps: true })


module.exports=mongoose.model('UserNote',UserNotes)


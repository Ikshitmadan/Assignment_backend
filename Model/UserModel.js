const mongoose = require('mongoose');

const UserSchema=new mongoose.Schema({

    email:{required:true,type:String,unique:true},
    password:{required:true,type:String},
    gender:{required:true,type:String},
    related:{required:true,type:String},
    name:{required:true,type:String },
    state:{required:true,type:String},
    city:{required:true,type:String},
    phoneNumber:{required:true,type:String}

},{timestamps:true});



module.exports= mongoose.model('User', UserSchema);
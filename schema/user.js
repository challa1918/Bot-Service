const mongoose = require("mongoose")
var UserSchema = new mongoose.Schema({
    
    phnno:Number,
    uname:String  
  
   });
   module.exports=mongoose.model("user",UserSchema)
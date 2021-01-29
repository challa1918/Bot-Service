const mongoose = require("mongoose")
var ProblemSchema = new mongoose.Schema({
    
    id:Number,
    problem:String,
    status:String,
    date:Date,
    uid:Number 
  
   });
   module.exports=mongoose.model("problem",ProblemSchema)
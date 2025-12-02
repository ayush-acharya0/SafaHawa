const mongoose = require("mongoose");
const trafficSchema = new mongoose.Schema({
    email:{type:String,required:true},
    password:{type:String,required:true}
});
const Traffic=mongoose.model("Traffic",trafficSchema);
module.exports=Traffic;

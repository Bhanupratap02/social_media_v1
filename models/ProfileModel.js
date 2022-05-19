/** @format */

const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const ProfileSchema = new Schema({
user:{type:Schema.Types.ObjectId , ref:"User"},
bio:{type:String,require:true},
social:{
youtube:{type:String},
instagram:{type:String},
twitter:{type:String},
facebook:{type:String},
}
},{timestamps:true})


module.exports = mongoose.model("Profile", ProfileSchema);
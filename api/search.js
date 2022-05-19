const express = require("express")
const router = express.Router()
const UserModel = require('../models/UserModel')
const authMiddleware = require("../middleware/authMiddleware")
const { result } = require("lodash")

// search user from database
// /api/search/:searchText
// private route , you need to login for this

router.get('/:searchText',authMiddleware,async (req,res) =>{

try {
   const { searchText } = req.params;
   const {userId} = req
   if (searchText.length === 0) return;
 const results = await UserModel.find({name:{
     $regex:searchText , $options:"i"
 }})
 const resultToBeSent = results.length > 0 && results.filter(result => result._id.toString() !== userId);

  res.json(resultToBeSent);
} catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
}

})


module.exports = router
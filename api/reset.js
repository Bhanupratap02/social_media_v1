const express = require('express')
const router = express.Router()
const UserModel = require('../models/UserModel')
const bcrypt = require('bcryptjs')
const nodemailer = require("nodemailer")
const sendGridTransport = require("nodemailer-sendgrid-transport");
const crypto = require('crypto')
const isEmail = require('validator/lib/isEmail')
const baseUrl = require("../utils/baseUrl")
  const options = {
    auth: {
      api_key: process.env.SENDGRID_KEY,
    },
  };

 const transporter = nodemailer.createTransport(sendGridTransport(options));

 // check user exists and send mail for password reset
 router.post('/',async (req,res)=>{
  try {
    const {email} = req.body;
    if(!isEmail(email)) {
        return res.status(401).send('Invalid Email')
    } 
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if(!user){
        return res.status(404).send('User not found')
    }
    const token = crypto.randomBytes(32).toString('hex')
    user.resetToken = token;
    user.expireToken = Date.now() + 3600000
    await user.save()

    const href = `${baseUrl}/reset/${token}`;
    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_FROM,
      subject: "Hi there! Password reset request",
      html: `<p>Hey ${user.name
        .split(" ")[0]
        .toString()}, There was a request for password reset. <a href=${href}>Click this link to reset the password </a>   </p>
      <p>This token is valid for only 1 hour.</p>`,
    };
    transporter.sendMail(mailOptions,(err,info)=> err && console.log(err))
    return res.status(200).send('Email sent successfully')
  } catch (error) {
      console.log(error);
      return res.status(500).send('Server Error')
  }
 })


 // verify the token and reset the password in db
 router.post('/token',async (req,res)=>{
     try {
         const {token,password} = req.body;
         if(!token){
             return res.status(401).send('Unauthorized')
         }
         if(password.length < 6) return res.status(401).send('unauthorized')
         const user = await UserModel.findOne({ resetToken:token});
         if(!user){
              return res.status(404).send("User not found");
         }
         if(Date.now() > user.expireToken){
             return res.status(401).send("Token expired.Generate new one");
         }
         user.password = await bcrypt.hash(password,10)
         user.resetToken = "";
         user.expireToken = undefined;

         await user.save();

         return res.status(200).send('Password update')
     } catch (error) {
         console.log(error)
         return res.status(500).send("Server Error")
     }
 })
module.exports = router



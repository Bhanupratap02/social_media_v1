/** @format */

const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server)
const next = require("next");

const dev = process.env.NODE_ENV == "production";
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();
require("dotenv").config({ path: "./config.env" });
const connectDb = require("./utilsServer/connectDb");
const {likeOrUnlikePost} = require("./utilsServer/likeOrUnlikePost")
const PORT = process.env.PORT || 3000;
app.use(express.json()); 
connectDb();
const {
  addUser,
  removeUser,
  findConnectedUser,
} = require("./utilsServer/roomActions");
const {
  loadMessage,
  sendMsg,
  setMsgToUnread,
  deleteMsg,
} = require("./utilsServer/messageActions");
io.on("connection",socket =>{

  // join event
socket.on('join',async ({userId})=>{
 const users = await addUser(userId,socket.id)
 console.log(users);
 setInterval(()=>{
socket.emit("connectedUsers", {
  users: users.filter((user) => user.userId !== userId),
});
 },10000)
})

socket.on("likePost",async({postId,userId,like})=>{
    const { success, name, profilePicUrl, username, postByUserId, error } =
      await likeOrUnlikePost(postId, userId, like);
    if(success){
      socket.emit("postLiked")
      if(postByUserId !== userId){
        const receivedSocket = findConnectedUser(postByUserId)
        if(receivedSocket && like) {
          // when you want to send data to one particular client
          io.to(receivedSocket.socketId).emit('newNotificationReceived',{
            name,
            profilePicUrl,
            username,
            postId
          })
        }
      }
    }
});
// loadMessage
socket.on("loadMessage",async({userId,messagesWith})=>{
    const {chat,error} = await loadMessage(userId,messagesWith)
    if(!error){
      socket.emit("messagesLoaded",{chat});
    }else{
      socket.emit("noChatFound")
    }
})


// send new msg
socket.on("sendNewMsg", async ({ userId, msgSendToUserId ,msg}) => {
 const { newMsg ,error} = await sendMsg(userId, msgSendToUserId, msg);

const receiversocket = findConnectedUser(msgSendToUserId)

if(receiversocket){
  // when you want to send message to a particular socket
  console.log("i got it")
  io.to(receiversocket.socketId).emit('newMsgreceived',{newMsg})
}else{
  await setMsgToUnread(msgSendToUserId)
}

 if(!error){
   socket.emit('msgSent',{newMsg})
 }
});

// delete msg
socket.on("deleteMsg", async ({ userId, messagesWith, messageId }) => {
  const {success} = await deleteMsg(userId,messagesWith,messageId)
  if(success){
    socket.emit("msgDeleted")
  }
});

// send msg from notification
socket.on("sendMsgFromNotification", async ({ userId, msgSendToUserId , msg}) => {
const { newMsg, error } = await sendMsg(userId, msgSendToUserId, msg);

const receiversocket = findConnectedUser(msgSendToUserId);

if (receiversocket) {
  // when you want to send message to a particular socket
  console.log("i got it");
  io.to(receiversocket.socketId).emit("newMsgreceived", { newMsg });
} else {
  await setMsgToUnread(msgSendToUserId);
}
 !error && socket.emit('msgSentFromNotificatio')


});

// disconnect event
socket.on("disconnect",()=>{
  removeUser(socket._id)
  console.log("User disconnected")
})

})


nextApp.prepare().then(() => {
app.use("/api/signup",require("./api/signup"))
app.use("/api/auth",require("./api/auth"))
app.use("/api/search",require("./api/search"))
app.use("/api/posts",require("./api/posts"))
app.use("/api/profile",require("./api/profile"))
app.use("/api/reset",require("./api/reset"))
 app.use("/api/notifications", require("./api/notifications"));
 app.use("/api/chats", require("./api/chats"));

  app.all("*", (req, res) => handle(req, res));

  server.
    listen(PORT, (err) => {
      console.log(`Express server running on ${PORT}`);
    });
});

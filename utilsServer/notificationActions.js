/** @format */

const UserModel = require("../models/UserModel");
const NotificationModel = require("../models/NotificationModel");
const setNotificationToUnread = async (userId) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user.unreadNotification) {
      user.unreadNotification = true;
      await user.save();
    }
  } catch (error) {
    console.log(error);
  }
};

const newLikeNotification = async (userId, postId, userToNotifyId) => {
  try {
    const userToNotify = await NotificationModel.findOne({
      user: userToNotifyId,
    });
    const newNotification = {
      type: "newLike",
      user: userId,
      post: postId,
      date: Date.now(),
    };
    await userToNotify.notification.unshift(newNotification);
    await userToNotify.save();

    await setNotificationToUnread(userToNotifyId);
    return;
  } catch (error) {
    console.log(error);
  }
};

const removeLikeNotification = async (userId, postId, userToNotifyId) => {
  try {
    // Here we are simply using $pull operator to remove the notification from notifications array.
    // Notice we are finding the notification inside Notifications array by adding its type, userId & postId

        await NotificationModel.findOneAndUpdate(
          { user: userToNotifyId },
          {
            $pull: {
              notification: {
                type: "newLike",
                user: userId,
                post: postId,
              },
            },
          }
        );

    return;

    //     const user = await NotificationModel.findOne({
    //       user: userToNotifyId,
    //     });
    //     const notificationToremove = user.notification.find(notification => notification.type === "newLike" && notification.post.toString() === postId
    //     && notification.user.toString() === userId
    //     )
    //     const indexof = user.notification.map(notification => notification._id.toString())
    //     .indexOf(notificationToremove._id.toString())

    //    await user.notification.splice(indexof,1);
    //    await user.save()
    //     return;
  } catch (error) {
    console.log(error);
  }
};

const newCommentNotification = async (
postId , commentId , userId , userToNotifyId,
text

) =>{
    try {
        
   const userToNotify = await NotificationModel.findOne({
     user: userToNotifyId,
   });
     const newNotification = {
        type:"newComment",
        user:userId,
        post:postId,
        commentId,
        text,
        date:Date.now()
     }
   await userToNotify.notification.unshift(newNotification);

   await userToNotify.save();

   await setNotificationToUnread(userToNotifyId);
   return;
    } catch (error) {
        console.log(error)
    }
}

const removeCommentNotification = async (postId,commentId,userId,userToNotifyId) =>{

    try {
     
        await NotificationModel.findOneAndUpdate(
          { user: userToNotifyId },
          {
            $pull: {
              notification: {
                type: "newComment",
                user: userId,
                post: postId,
                commentId: commentId,
              },
            },
          }
        );

        return;




    //   const user = await NotificationModel.findOne({ user: userToNotifyId });
    //   const notificationToRemove = await user.notification.find(
    //     notification =>
    //       notification.type === "newComment" &&
    //       notification.user.toString() === userId &&
    //       notification.post.toString() === postId &&
    //       notification.commentId === commentId
    //   );
    //   const indexOf = await user.notification
    //     .map(notification => notification._id.toString())
    //     .indexOf(notificationToRemove._id.toString());
    //   await user.notification.splice(indexOf, 1);
    //   await user.save();
    } catch (error) {
       console.log(error) 
    }

}

const newFollowerNotification = async (userId,userToNotifyId) =>{

try {
 const user = await NotificationModel.findOne({user:userToNotifyId})
 const newNotification ={
     type:"newFollower",
     user:userId,
     date:Date.now()
 }
 await user.notification.unshift(newNotification)
 await user.save()
 await setNotificationToUnread(userToNotifyId)
 return;

} catch (error) {
    console.log(error)
}

}

const removeFollowerNotification = async (userId,userToNotifyId) =>{
  try {

      await NotificationModel.findOneAndUpdate(
        { user: userToNotifyId },
        { $pull: { notification: { type: "newFollower", user: userId } } }
      );

      return;





    // const user = await NotificationModel.findOne({ user: userToNotifyId });
    // const notificationToRemove = await user.notification.find(
    //   notification =>
    //     notification.type === "newFollower" && notification.user.toString() === userId
    // );
    // const indexof = await user.notification
    //   .map(notification => notification._id.toString())
    //   .indexOf(notificationToRemove._id.toString());
    // await user.notification.splice(indexof, 1);
    // await user.save();
  } catch (error) {
      console.log(error)
  }
}

module.exports = {
  newLikeNotification,
  removeLikeNotification,
  newCommentNotification,
  removeCommentNotification,
  newFollowerNotification,
  removeFollowerNotification,
};

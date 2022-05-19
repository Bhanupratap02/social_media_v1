/** @format */

const express = require("express");
const router = express.Router();
const UserModel = require("../models/UserModel");
const FollowerModel = require("../models/FollowerModel");
const PostModel = require("../models/PostModel");
const authMiddleware = require("../middleware/authMiddleware");
const uuid = require("uuid").v4;
const {
  newLikeNotification,
  removeLikeNotification,
  newCommentNotification,
  removeCommentNotification,
} = require("../utilsServer/notificationActions");
// create a post
router.post("/", authMiddleware, async (req, res) => {
  const { text, location, picUrl } = req.body;

  if (text.length < 1)
    return res.status(401).send("text must be atlest 1 character");

  try {
    const newPost = {
      user: req.userId,
      text,
    };
    if (location) newPost.location = location;
    if (picUrl) newPost.picUrl = picUrl;

    const post = await new PostModel(newPost).save();
    const postCreated = await PostModel.findById(post._id).populate("user");
    return res.json(postCreated);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
});

// // get all the posts
// router.get("/", authMiddleware, async (req, res) => {
//   const { pageNumber } = req.query;
//   const number = Number(pageNumber);
//   const size = 8;
//   try {
//     let posts;
//     if (number === 1) {
//       posts = await PostModel.find()
//         .limit(size)
//         .sort({ createdAt: -1 })
//         .populate("user")
//         .populate("comments.user");
//     }
//     else{
//       const skips = size*(number - 1)
//        posts = await PostModel.find()
//         .skip(skips)
//          .limit(size)
//          .sort({ createdAt: -1 })
//          .populate("user")
//          .populate("comments.user");
//     }
//      const {userId}= req
//      const loggedUsser = await FollowerModel.findOne({user:userId})
//      if(posts.length === 0){
//        return res.json([])
//      }
//      let postsToBesent = []
//      if(loggedUsser.following.length === 0){
//        postsToBesent = posts.filter(post => post.user._id.toString() === userId)
//      }else{
//        for(let i=0;i<loggedUsser.following.length;i++){
//       const foundPost =   posts.filter(
//            post =>
//            post.user._id.toString() === loggedUsser.following[i].user.toString() ||
//            post.user._id.toString() === userId
//          )
//          if(foundPost.length > 0) postsToBesent.push(...foundPost)
//        }
//      }
//      return res.json(postsToBesent)
//     // return res.json(posts);
//   } catch (error) {
//     console.log(error);
//     return res.status(500).send("Server Error");
//   }
// });

router.get("/", authMiddleware, async (req, res) => {
  const { pageNumber } = req.query;

  try {
    const number = Number(pageNumber);
    const size = 8;
    const { userId } = req;

    const loggedUser = await FollowerModel.findOne({ user: userId }).select(
      "-followers"
    );

    let posts = [];
    if (number === 1) {
      if (loggedUser.following.length > 0) {
        posts = await PostModel.find({
          user: {
            $in: [
              userId,
              ...loggedUser.following.map((following) => following.user),
            ],
          },
        })
          .limit(size)
          .sort({ createdAt: -1 })
          .populate("user")
          .populate("comments.user");
      }
      //
      else {
        posts = await PostModel.find({ user: userId })
          .limit(size)
          .sort({ createdAt: -1 })
          .populate("user")
          .populate("comments.user");
      }
    } //
    else {
      const skips = size * (number - 1);

      if (loggedUser.following.length > 0) {
        posts = await PostModel.find({
          user: {
            $in: [
              userId,
              ...loggedUser.following.map((following) => following.user),
            ],
          },
        })
          .skip(skips)
          .limit(size)
          .sort({ createdAt: -1 })
          .populate("user")
          .populate("comments.user");
      }
      //
      else {
        posts = await PostModel.find({ user: userId })
          .skip(skips)
          .limit(size)
          .sort({ createdAt: -1 })
          .populate("user")
          .populate("comments.user");
      }
    }

    return res.json(posts);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
});

// get post by id
router.get("/:postId", authMiddleware, async (req, res) => {
  try {
    const post = await PostModel.findById(req.params.postId)
      .populate("user")
      .populate("comments.user");
    if (!post) {
      return res.status(404).send("Post not found");
    }
    return res.json(post);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
});

// delete post
router.delete("/:postId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const { postId } = req.params;
    const post = await PostModel.findById(req.params.postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    const user = await UserModel.findById(userId);
    if (post.user.toString() !== userId) {
      if (user.role === "root") {
        await post.remove();
        return res.status(200).send("Post Deleted Succesfully");
      } else {
        return res.status(401).send("Unauthorized");
      }
    }
    await post.remove();
    return res.status(200).send("Post Deleted Succesfully");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
});

// Like a post
router.post("/like/:postId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const { postId } = req.params;
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    const isLiked =
      post.likes.filter((like) => like.user.toString() === userId).length > 0;
    if (isLiked) {
      return res.status(401).send("Post alreday liked");
    }
    await post.likes.unshift({ user: userId });
    await post.save();
    if (post.user.toString() !== userId) {
      await newLikeNotification(userId, postId, post.user.toString());
    }

    return res.status(200).send("Post liked");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
});
// Unlike a post
router.put("/unlike/:postId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const { postId } = req.params;
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    const isLiked =
      post.likes.filter((like) => like.user.toString() === userId).length === 0;
    if (isLiked) {
      return res.status(401).send("Post not liked before");
    }
    const index = post.likes
      .map((like) => like.user.toString())
      .indexOf(userId);
    await post.likes.splice(index, 1);
    await post.save();

    if (post.user.toString() !== userId) {
      await removeLikeNotification(userId, postId, post.user.toString());
    }
    return res.status(200).send("Post unliked");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
});

// Get  All Likes
router.get("/like/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await PostModel.findById(postId).populate("likes.user");
    if (!post) {
      return res.status(404).send("Post not found");
    }
    return res.status(200).json(post.likes);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
});

// create a comment
router.post("/comment/:postId", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    if (text.length < 1)
      return res.status(401).send("comment should be atleast 1 character");
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    const newComment = {
      _id: uuid(),
      text,
      user: req.userId,
      data: Date.now(),
    };
    await post.comments.unshift(newComment);
    await post.save();
    if(post.user.toString()!== req.userId){
      await newCommentNotification(postId,newComment._id,req.userId,post.user.toString(),text)
    }
    return res.status(200).send(newComment._id);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
});

// delete a comment

const deleteComment = async (post, commentId, res,req) => {
  const index = post.comments.map((comment) => comment._id).indexOf(commentId);
  await post.comments.splice(index, 1);
  await post.save();
  if (post.user.toString() !== req.userId) {
   await removeCommentNotification(req.params.postId,commentId,req.userId,post.user.toString());
  }
  return res.status(200).send("Comment Deleted Succesfully");
};
router.delete("/:postId/:commentId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req;
    const { postId, commentId } = req.params;
    const post = await PostModel.findById(req.params.postId);
    if (!post) {
      return res.status(404).send("Post not found");
    }
    const comment = post.comments.find((comment) => comment._id === commentId);
    if (!comment) {
      return res.status(404).send("No Comment Found");
    }
    const user = await UserModel.findById(userId);
    if (comment.user.toString() !== userId) {
      if (user.role === "root") {
        await deleteComment(post, commentId, res,req);
      } else {
        return res.status(401).send("Unauthorized");
      }
    }

    await deleteComment(post, commentId, res,req);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;

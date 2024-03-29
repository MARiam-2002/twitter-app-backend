import { nanoid } from "nanoid";
import postModel from "../../../../DB/models/post.model.js";
import userModel from "../../../../DB/models/user.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import cloudinary from "../../../utils/cloud.js";

export const addPost = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const isUser = await userModel.findOne({ email: req.user.email });
  if (!isUser) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  const post = await postModel.create({
    content,
    user: req.user._id,
  });

  if (req.files) {
    const cloudFolder = nanoid();
    let images = [];
    for (const file of req.files.subImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        { folder: `${process.env.FOLDER_CLOUDINARY}/Trips/${cloudFolder}` }
      );
      images.push({ url: secure_url, id: public_id });
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.defaultImage[0].path,
      {
        folder: `${process.env.FOLDER_CLOUDINARY}/Trips/${cloudFolder}`,
      }
    );
    await postModel.findByIdAndUpdate(post._id, {
      subImages: images,
      defaultImage: { url: secure_url, id: public_id },
      cloudFolder,
    });
  }
  const populatePost = await postModel
    .findById(post._id)
    .populate(
      "user",
      "-password -forgetCode -activationCode -isConfirmed -__v -role "
    );
  return res.status(201).json({ success: true, post: populatePost });
});

export const getallPost = asyncHandler(async (req, res, next) => {
  const posts = await postModel
    .find({ ...req.query })
    .populate([
      {
        path: "user",
        model: "User",
      },
      {
        path: "postData",
        model: "Post",
        populate: {
          path: "user",
          model: "User",
        },
      },
    ])
    .pagination(req.query.page)
    .customSelect(req.query.fields)
    .sort(req.query.sort);
  return res.status(200).json({ success: true, posts });
});

export const likeHandler = async (req, res, next) => {
  const { postId } = req.params;
  const post = await postModel.findById(postId);
  if (!post) {
    return res.status(400).json({ success: false, message: "Post not found" });
  }
  const user = await userModel.findById(req.user._id);
  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }
  const isLike = user.Likes && user.Likes.includes(postId);
  const option = isLike ? "$pull" : "$addToSet";
  const postUser = await postModel.findOneAndUpdate(
    { _id: postId },
    { [option]: { Likes: user._id } },
    { new: true }
  );
  const modifiedUser = await userModel.findOneAndUpdate(
    { _id: req.user._id },
    { [option]: { Likes: postId } },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    status: 200,
    message: "This post has been added to the wishlist",
  });
};
export const wishlist = asyncHandler(async (req, res, next) => {
  const user = await userModel.findById(req.user._id).populate("Likes");

  return res.status(200).json({
    success: true,
    status: 200,
    message: "These are all the products that you added to the wishlist",
    data: user.Likes,
  });
});
export const retweetHandler = async (req, res, next) => {
  const { postId } = req.params;
  const deletedPost = await postModel.findOneAndDelete({
    user: req.user._id,
    postData: postId,
  });
  let retweetObj = deletedPost;
  if (retweetObj === null) {
    const post = await postModel.create({
      user: req.user._id,
      postData: postId,
    });
  }
  const option = deletedPost !== null ? "$pull" : "$addToSet";
  const postUser = await postModel.findOneAndUpdate(
    { _id: postId },
    { [option]: { retweetsUser: user._id } },
    { new: true }
  );
  const modifiedUser = await userModel.findOneAndUpdate(
    { _id: req.user._id },
    { [option]: { retweets: postId } },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    status: 200,
    message: "This post has been added to the retweets",
    postUser,
  });
};

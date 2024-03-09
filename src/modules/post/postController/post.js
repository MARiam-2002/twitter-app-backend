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
        { folder: `${process.env.FOLDER_CLOUDINARY}/twitter/${cloudFolder}` }
      );
      images.push({ url: secure_url, id: public_id });
    }
    post.images = images;
    post.cloudFolder = cloudFolder;
    await post.save();
  }
  const populatePost = await postModel
    .findById(post._id)
    .populate("user", "-password -forgetCode -activationCode -isConfirmed -__v -role ");
  return res.status(201).json({ success: true, post: populatePost });
})
import mongoose, { Schema, Types, model } from "mongoose";

const postSchema = new Schema(
  {
    content: {
      type: String,
      trim: true,
      default: "",
    },
    user: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
    },
    subImages: [
      {
        url: {
          type: String,
        },
        id: {
          type: String,
        }
      }
    ],
    defaultImage: {
      url: { type: String, },
      id: { type: String, },
    },
    Likes: [
      {
        type: Types.ObjectId,
        ref: "User",
      },
    ],
    cloudFolder: { type: String, unique: true },

  },
  { timestamps: true }
);
const postModel = mongoose.models.postModel || model("Post", postSchema);
export default postModel;
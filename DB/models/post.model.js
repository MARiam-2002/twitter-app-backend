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
    cloudFolder: { type: String, unique: true ,default: ""},

  },
  { timestamps: true, strictQuery: true, toJSON: { virtuals: true } }
);

postSchema.query.pagination = function (page) {
  page = !page || page < 1 || isNaN(page) ? 1 : page;
  const limit = 16;
  const skip = limit * (page - 1);
  return this.skip(skip).limit(limit);
};
postSchema.query.customSelect = function (fields) {
  if (!fields) return this;
  const modelKeys = Object.keys(postModel.schema.paths);
  const queryKeys = fields.split(" ");
  const matchKeys = queryKeys.filter((key) => modelKeys.includes(key));
  return this.select(matchKeys);
};

const postModel = mongoose.models.postModel || model("Post", postSchema);
export default postModel;
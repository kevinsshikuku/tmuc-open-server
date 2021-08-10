import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Post schema that has references to User, Like and Comment schemas
 */
const postSchema = Schema(
  {
    title: String,
    description: String,
    features: String,
    location: String,
    inStock: String,

    price:String,
    crossedPrice:String,

    image: String,
    imagePublicId:String,

    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    views: [
      {
       type:Schema.Types.ObjectId,
       ref:'View'
      }
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Like',
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Post', postSchema);

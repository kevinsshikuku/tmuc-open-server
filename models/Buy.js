import mongoose from 'mongoose';
const Schema = mongoose.Schema;

/**
 * Buy schema that has references to User, Like and Comment schemas
 */
const buySchema = Schema(
  {
    title: String,
    description:String,
    features:String,
    location:String,

    pricerange:String,

    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
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

export default mongoose.model('Buy', buySchema);

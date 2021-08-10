import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * view schema that has references to Post and User schema
 */
const viewSchema = Schema(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('View', viewSchema);
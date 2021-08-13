import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Reply schema that has reference to Message and User schema
 */
const replySchema = Schema(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: Schema.Types.ObjectId,
      ref: 'Message',
    },
    body: String,
  },
  { timestamps: true }
);

export default mongoose.model('Reply', replySchema);

import mongoose from 'mongoose';

const Schema = mongoose.Schema;

/**
 * Message schema that has reference to user schema
 */
const messageSchema = Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    replies: [
      {
      type: Schema.Types.ObjectId,
      ref: "Reply"
    }],
    body: String,
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);

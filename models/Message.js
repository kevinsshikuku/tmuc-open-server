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
    body: String,
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);

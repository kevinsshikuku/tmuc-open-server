import { pubSub } from '../utils/apollo-server';
import { MESSAGE_CREATED } from '../constants/Subscriptions';

const Query = {
  /**
   * Gets user's specific conversation
   */
  getMessages: async ( _, __, { Message }) => {
    const messages = await Message.find()
      .populate('sender')
      .sort({ updatedAt: 'desc' });

    return messages;
  }
}


/* ----------------------Mutations---------------------------------------------------- */
const Mutation = {
  /**
   * Creates a message
   *
   * @param {string} message
   * @param {string} sender
   * @param {string} receiver
   */
  createMessage: async ( __,{  body },{ Message, User, authUser }
  ) => {
    let sndr;
    if(authUser){
     sndr = await User.findById(authUser.id)
    }

    let newMessage = await new Message({
      body,
      sender: sndr,
    }).save();

    newMessage = await newMessage
      .populate('sender')
      .execPopulate();

    // Publish message created event
    pubSub.publish(MESSAGE_CREATED, { messageCreated: newMessage });


    return newMessage;
  },
};

export default { Mutation, Query };

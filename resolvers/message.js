import { pubSub } from '../utils/apollo-server';
import { MESSAGE_CREATED } from '../constants/Subscriptions';


const Query = {
  /**
   * Gets user's specific conversation
   */
  getMessages: async ( _, __, { Message }) => {
    const messages = await Message.find()
      .populate('sender')
      .populate({
        path: "replies",
          populate:[
            { path:"author" }
          ]
      })
      .sort({ updatedAt: 'desc' });

    return messages;
  },

  /**
   * Gets user's specific conversation
   */
  getMessage: async ( _, {messageId}, { Message }) => {
    const message = await Message.findById(messageId)
      .populate('sender')
      .populate({
        path: "replies",
          populate:[
            { path:"author" }
          ]
      })
      .sort({ updatedAt: 'desc' });

    return message;
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
/* -------------------------------------------------------------------------- */


  /**
   * Creates a message
   *
   * @param {string} messageId
   * @param {string} body
   */
  sendReply: async ( __,{  body, messageId },{ Message, User, Reply, authUser }
  ) => {
   if(!messageId){
     throw new Error("message Id is required")
   }

   if(!body){
     throw new Error("you can not send a blank reply")
   }

    let author;
    if(authUser){
     author = await User.findById(authUser.id)
    }


    let newReply = await new Reply({
      body,
      author
    }).save();


    newReply = await newReply
      .populate('author')
      .populate('message')
      .execPopulate();


// find a user from model and replys field
    await Message.findOneAndUpdate(
      { _id: messageId },
      { $push: { replies: newReply.id } }
    );

    return newReply;
  },
};

export default { Mutation, Query };

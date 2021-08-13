import { gql } from 'apollo-server-express';

/**
 * Comment schema
 */

const MessageSchema = gql`
  # -----------------Model Objects----------------------------------------
  type Message {
    id: ID
    body: String
    sender: User
    replies: [Reply]
    createdAt: String
  }

 type Reply {
   id: ID
   body:String
   author: User
   message: Message
   createdAt: String
 }

#--------------------------------------------------------------------------
extend type Query {
  getMessages: [Message]
  getMessage(messageId:ID!):  Message

 }

  # --------------- Mutations------------------------------------------
  extend type Mutation {
    # Creates a post message
    createMessage(
        body: String!
     ): Message

    # Creates a post message
    sendReply(
        body: String!
        messageId: ID!
     ): Reply

    # Deletes a post comment
    deleteMessage(id: ID!): Message
  }
`;

export default MessageSchema;

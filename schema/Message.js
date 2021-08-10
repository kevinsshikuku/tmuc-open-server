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
    createdAt: String
  }

#--------------------------------------------------------------------------
extend type Query {
  getMessages: [Message]

 }

  # --------------- Mutations------------------------------------------
  extend type Mutation {
    # Creates a post message
    createMessage(
        body: String!
     ): Message

    # Deletes a post comment
    deleteMessage(id: ID!): Message
  }
`;

export default MessageSchema;
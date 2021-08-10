import { gql } from 'apollo-server-express';

/**
 * Comment schema
 */



const CommentSchema = gql`
  # -----------------Model Objects----------------------------------------
  type Comment {
    id: ID!
    comment: String!
    author: ID
    post: ID
    createdAt: String
  }

  # ------------------Return Payloads---------------------------------------
  type CommentPayload {
    id: ID
    comment: String
    author: User
    post: ID
    createdAt: String
  }

  # --------------- Mutations------------------------------------------
  extend type Mutation {
    # Creates a post comment
    createComment(
        comment: String!
        author: ID!
        postId: ID!
     ): Comment

    # Deletes a post comment
    deleteComment(id: ID!): Comment
  }
`;

export default CommentSchema;
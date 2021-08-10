import { gql } from 'apollo-server-express';

/**
 * Like schema
 */
const LikeSchema = gql`
  # -----------------Model Objects----------------------------------------
  type Like {
    id: ID!
    post: ID
    user: ID
  }

  # ----------------Return Payloads-----------------------------------------
  type LikePayload {
    id: ID!
    post: PostPayload
    user: UserPayload
  }


  # -------------- Mutations-------------------------------------------
  extend type Mutation {
    # Creates a like for post
    createLike(
        userId: ID!
        postId: ID!
     ): LikePayload

    # Deletes a post like
    deleteLike(id: ID!): Like
  }
`;

export default LikeSchema;

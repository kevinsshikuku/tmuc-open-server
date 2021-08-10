import { gql } from 'apollo-server-express';

/**
 * Follow schema
 */
const FollowSchema = gql`
  # ------------------Model Objects---------------------------------------
  type Follow {
    id: ID!
    user: ID
    follower: ID
  }

  # ----------------Mutations-----------------------------------------
  extend type Mutation {
    # Creates a following/follower relationship between users
    createFollow(
        userId: ID!
        followerId: ID!
     ): Follow

    # Deletes a following/follower relationship between users
    deleteFollow(id: ID!): Follow
  }
`;

export default FollowSchema;

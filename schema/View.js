import { gql } from 'apollo-server-express';

/**
 * Rating schema
 */
const ViewSchema = gql`
  # ----------------------Model Objects-----------------------------------
  type View {
    id: ID!
    post: ID
    user: ID
  }

  # ------------------------Return Payloads---------------------------------
  type ViewPayload {
    id: ID!
    post: PostPayload
  }

  # -------------------------Mutations--------------------------------
  extend type Mutation {
    # Creates a rating for post
    createView(
        userId: ID!
        postId: ID!
     ): View
  }
`;
export default ViewSchema;
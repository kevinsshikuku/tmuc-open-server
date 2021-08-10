import { gql } from 'apollo-server-express';

/**
 * Buy schema
 */
const BuySchema = gql`
  # --------------------Model Objects-------------------------------------
  type Buy {
    id: ID!

    title: String
    description:String
    features:String
    location:String
    pricerange:String

    author: User!
    likes: [Like]
    comments: [Comment]
    createdAt: String
    updatedAt: String
  }

  # -----------------Return Payloads----------------------------------------
  type UserBuysPayload {
    buys: [BuyPayload]!
    count: String!
  }

  type BuyPayload {
    id: ID!

    title: String
    description:String
    features:String
    location:String
    pricerange:String
    author: UserPayload
    createdAt: String
    updatedAt: String
  }

  type BuysPayload {
    buys: [BuyPayload]!
    count: String!
  }

type BuysConnection {
  cursor: String
  count: String
  hasMore: Boolean
  buys:[BuyPayload]
}

type userBuysConnection {
  cursor: String
  count: String
  hasMore:Boolean
  buys: [BuyPayload]

}





  # ------------------Queries---------------------------------------
  extend type Query {
    # Gets user buys by username
    getUserBuys(username: String!, limit: Int, skip: Int): userBuysConnection

    # Gets Buys from followed users
    getFollowedBuys(userId: String!, skip: Int, limit: Int): BuysPayload

    # Gets all Buys
    getBuys(skip: Int, limit: Int): BuysPayload

#-------------------------------------------------------------------------- */
    # Gets paginated Buys
    getPaginatedBuys(limit: Int, after:String): BuysConnection

# -------------------------------------------------------------------------- */


    # Searches Buys by title or description
    searchBuys(searchQuery: String!): [BuyPayload]

    # Gets buy by id
    getBuy(id: ID!): BuyPayload
  }


  # ----------------Mutations-----------------------------------------
  extend type Mutation {
    # Creates a new buy
      createBuy(
            title: String
            description:String
            features: String
            location:String

            pricerange:String
            authorId: ID!
     ): BuyPayload

    # Updates user buy
     updateBuy(
            authorId: ID!
            buyId: ID!

            title: String
            description:String
            features: String

            price: String
            crossedPrice:String

     ): BuyPayload

    # Deletes a user buy
    deleteBuy( id: ID! imagePublicId: String ):BuyPayload
  }
`;
export default BuySchema;
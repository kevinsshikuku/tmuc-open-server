import { gql } from 'apollo-server-express';

/**
 * Post schema
 */
const PostSchema = gql`
  # --------------------Model Objects-------------------------------------
  type Post {
    id: ID!
    title: String
    description:String
    features:String
    location:String
    price:String
    crossedPrice:String
    image: String
    imagePublicId: String
    author: User!
    likes: [LikePayload]
    views:[View]
    comments: [Comment]
    inStock: String
    createdAt: String
    updatedAt: String
  }

  # -----------------Return Payloads----------------------------------------
  type UserPostsPayload {
    posts: [PostPayload]!
    count: String!
  }

  type PostPayload {
    id: ID!
    title: String
    description:String
    features:String
    inStock: String
    location:String
    price:String
    crossedPrice:String
    image: String
    imagePublicId: String
    author: UserPayload
    likes: [LikePayload]
    views:[View]
    comments: [CommentPayload]
    createdAt: String
    updatedAt: String
  }

  type PostsPayload {
    posts: [PostPayload]!
  }

type PostsConnection {
  cursor: String
  count: String
  hasMore: Boolean
  posts:[PostPayload]
}

type userPostConnection {
  cursor: String
  count: String
  hasMore:Boolean
  posts: [PostPayload]

}





  # ------------------Queries---------------------------------------
  extend type Query {
    # Gets user posts by username
    getUserPosts(username: String!, limit: Int, skip: Int): userPostConnection

    # Gets posts from followed users
    getFollowedPosts(userId: String!, skip: Int, limit: Int): PostsPayload

    # Gets all posts
    getPosts(skip: Int, limit: Int): PostsPayload

#-------------------------------------------------------------------------- */
    # Gets paginated posts
    getPaginatedPosts(limit: Int, cursor:String): PostsConnection

# -------------------------------------------------------------------------- */


    # Searches posts by title or description
    searchPosts(searchQuery: String!): [PostPayload]

    # Gets post by id
    getPost(id: ID!): PostPayload
  }


  # ----------------Mutations-----------------------------------------
  extend type Mutation {
    # Creates a new post
      createPost(
            title: String
            description:String
            features: String
            location:String
            price:String
            crossedPrice:String
            rating:String
            image: Upload
            authorId: ID!
     ): PostPayload

    # Updates user post
     updatePost(
            # authorId: ID!
            postId: ID!
            title: String
            description:String
            features: String
            inStock: String
            price: String
            crossedPrice:String
     ): PostPayload

    # Deletes a user post
    deletePost( id: ID! imagePublicId: String ):PostPayload
  }




  # --------------Subscriptions-------------------------------------------
  extend type Subscription {
    # Subscribes to new post event
      newPost: PostPayload
  }

`;
export default PostSchema;
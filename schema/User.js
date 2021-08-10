import { gql } from 'apollo-server-express';


/**
 * User schema
 */
const UserSchema = gql`

  # -----------------Model Objects----------------------------------------
  type User {
    id: ID!
    image: String
    phonenumber: String!
    username: String!
    fullname: String
    facebook: String
    twitter: String
    instagram: String
    email: String
    location: String
    coverImage: File
    password: String!
    resetToken: String
    imagePublicId: String
    resetTokenExpiry: String
    coverImagePublicId: String
    isOnline: Boolean
    posts: [PostPayload]
    buys:[BuyPayload]
    likes: [LikePayload]
    views:[View]
    comments: [Comment]
    followers: [Follow]
    following: [Follow]
    businessdescription: String
    createdAt: String
    updatedAt: String
  }

  type File {
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type Token {
    token: String!
  }

  type SuccessMessage {
    message: String!
  }



  # -----------------Return Payloads----------------------------------------
  type UserPayload {
    id: ID!
    phonenumber: String
    username: String
    fullname: String
    location: String
    facebook: String
    twitter: String
    instagram: String
    email: String
    password: String
    image: String
    imagePublicId: String
    coverImage: String
    coverImagePublicId: String
    isOnline: Boolean
    posts: [PostPayload]
    buys:[BuyPayload]
    likes: [LikePayload]
    views:[View]
    followers: [Follow]
    following: [Follow]
    businessdescription: String,
    unseenMessage: Boolean
    createdAt: String
    updatedAt: String
  }

  type UsersPayload {
    users: [UserPayload]!
    count: String!
  }

  type IsUserOnlinePayload {
    userId: ID!
    isOnline: Boolean
  }

  # -------------------Queries--------------------------------------
  extend type Query {
    # Verifies reset password token
    verifyResetPasswordToken(email: String, token: String!): SuccessMessage

    # Gets the currently logged in user
    getAuthUser: UserPayload

    # Gets user followers by username
    getUserFollowers(username: String!, skip: Int, limit: Int): [UserPayload]

    # Gets user by username or by id
    getUser(username: String): UserPayload

    # Gets all users
    getUsers(userId: String!, skip: Int, limit: Int): UsersPayload

    # Searches users by username or fullName
    searchUsers(searchQuery: String!): [UserPayload]

    # Gets Suggested people for user
    suggestPeople(userId: String!): [UserPayload]
  }



  # ------------------Mutations---------------------------------------
  extend type Mutation {
    # Signs in user
    signin(
        phoneOrUsername: String!
        password: String!
     ): Token

    # Signs up new user
    signup(
        phonenumber: String!
        username: String!
        password: String!
        confirmPassword: String!
     ): Token

    # Requests reset password
    requestPasswordReset(phonenumber: String!): SuccessMessage

    # Resets user password
    resetPassword(
        phonenumber: String!
        token: String!
        password: String!
      ):Token

    # Edit user profile
     editUserProfile(
        id:ID,
        fullname: String
        email: String
        location: String
        businessdescription: String
     ): Token

    addLinks(
        id: ID
        facebook: String
        twitter: String
        instagram: String
    ): Token

    # Uploads user Profile or Cover photo
    uploadUserPhoto(
        id: ID!
        image: Upload!
        isCover: Boolean
     ): UserPayload
  }

  # --------------Subscriptions-------------------------------------------
  extend type Subscription {
    # Subscribes to is user online event
    isUserOnline(authUserId: ID!, userId: ID!): IsUserOnlinePayload
  }
`;
export default UserSchema;
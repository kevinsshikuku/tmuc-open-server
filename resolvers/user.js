import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { withFilter , ApolloError} from 'apollo-server';
import {paginateResults} from "../utils/utils";

// import { uploadToCloudinary } from '../utils/cloudinary';
import { upLoadResponse } from '../utils/cloudinary';
import { generateToken } from '../utils/generate-token';
import { sendEmail } from '../utils/email';
import { pubSub } from '../utils/apollo-server';

import { IS_USER_ONLINE } from '../constants/Subscriptions';

const AUTH_TOKEN_EXPIRY = '1y';
const RESET_PASSWORD_TOKEN_EXPIRY = 3600000;



const Query = {
  /**
   * Gets the currently logged in user/authuser
   */
  getAuthUser: async (_, __, { authUser, User }) => {
    if (!authUser) return null;
    // If user is authenticated, update it's isOnline field to true
    const user = await User.findOneAndUpdate( {username: authUser.username},
      { phone: authUser.phone },
      { isOnline: true }
    )
      .populate({
        path: 'posts',
        populate: [
          {
            path: 'author',
            populate: [
              { path: 'followers' },
              { path: 'following' }
            ],
          },
          { path: 'comments', populate: { path: 'author' } },
          { path: 'likes',
            populate:[
              { path: 'post',
                  populate: [
                    {
                      path: 'author',
                      populate: [
                        { path: 'followers' },
                        { path: 'following' }
                      ],
                    },
                    { path: 'comments', populate: { path: 'author' } },
                    { path: 'likes' },
                  ],
                },
                { path: 'user'},
        ]
           },
        ],
        options: { sort: { createdAt: 'desc' } },
      })
      .populate({
        path: 'buys',
        populate: [
          {
            path: 'author',
            populate: [
              { path: 'followers' },
              { path: 'following' }
            ],
          }
        ],
        options: { sort: { createdAt: 'desc' } },
      })
      .populate({
        path: 'likes',
        populate:[
           { path: 'post',
              populate: [
                {
                  path: 'author',
                  populate: [
                    { path: 'followers' },
                    { path: 'following' }
                  ],
                },
                { path: 'comments', populate: { path: 'author' } },
                { path: 'likes' },
              ],
            },
        ]
      })
      .populate('followers')
      .populate('following')



    return user;
  },



  /**
   * Gets user by username
   *
   * @param {string} id
   */
  getUser: async (_, {  username }, { User }) => {
    if (!username) {
      throw new Error('useId is required params.');
    }
    const query = { username: username };
    const user = await User.findOne(query)
      .populate({
        path: 'posts',
        populate: [
          {
            path: 'author',
            populate: [
              { path: 'followers' },
              { path: 'following' }
            ],
          },
          { path: 'comments', populate: { path: 'author' } },
          { path: 'likes',
            populate:[
              { path: 'post',
                  populate: [
                    {
                      path: 'author',
                      populate: [
                        { path: 'followers' },
                        { path: 'following' }
                      ],
                    },
                    { path: 'comments', populate: { path: 'author' } },
                    { path: 'likes' },
                  ],
                },
                { path: 'user'},
        ]
           },
        ],
        options: { sort: { createdAt: 'desc' } },
      })
      .populate({
        path: 'buys',
        populate: [
          {
            path: 'author',
            populate: [
              { path: 'followers' },
              { path: 'following' }
            ],
          }
        ],
        options: { sort: { createdAt: 'desc' } },
      })
      .populate({
        path: 'likes',
        populate:[
           { path: 'post',
              populate: [
                {
                  path: 'author',
                  populate: [
                    { path: 'followers' },
                    { path: 'following' }
                  ],
                },
                { path: 'comments', populate: { path: 'author' } },
                { path: 'likes' },
              ],
            },
        ]
      })
      .populate('followers')
      .populate('following')

    if (!user) {
      throw new Error("User with given Details doesn't exists.");
    }

    return user;
  },




  /**
   * Gets user posts by username
   * @param {string} username
   * @param {int} skip how many posts to skip
   * @param {int} limit how many posts to limit
   */
  getUserPosts: async (_, { username, after, limit }, { User, Post }) => {
    const user = await User.findOne({ username }).select('_id');

    const query = { author: user._id };
    const count = await Post.find(query).countDocuments();
    const results = await Post.find(query)
      .populate({
        path: 'author',
        populate: [
          { path: 'following' },
          { path: 'followers' }
        ],
      })
      .populate(
          { path: 'likes',
            populate:[
              { path: 'post',
                  populate: [
                    {
                      path: 'author',
                      populate: [
                        { path: 'followers' },
                        { path: 'following' }
                      ],
                    },
                    { path: 'comments', populate: { path: 'author' } },
                    { path: 'likes' },
                  ],
                },
                { path: 'user'},
        ]
           },
      )
      .populate({
        path: 'comments',
        options: { sort: { createdAt: 'desc' } },
        populate: [
          { path: 'author' },
          { path: 'commentcomments' }
        ],
      })
      .limit(limit)
      .sort({ _id: -1 });
    const posts = paginateResults({after, results})
    return {
        posts,
        count,
        cursor:  posts.length ? posts[posts.length - 1].id : null,
        hasMore: posts.length
                  ? posts[posts.length - 1].id !==
                        results[results.length - 1].id
                          : false
    };
  },




  /**
   * Gets user posts by username
   * @param {string} username
   * @param {int} skip how many posts to skip
   * @param {int} limit how many posts to limit
   */
  getUserBuys: async (_, { username, after, limit }, { User, Buy }) => {
    const user = await User.findOne({ username }).select('_id');

    const query = { author: user._id };
    const count = await  Buy.find(query).countDocuments();
    const results = await Buy.find(query)
      .populate({
        path: 'author',
        populate: [
          { path: 'following' },
          { path: 'followers' }
        ],
      })
      .populate('likes')
      .populate({
        path: 'comments',
        options: { sort: { createdAt: 'desc' } },
        populate: [
          { path: 'author' },
          { path: 'commentcomments' }
        ],
      })
      .limit(limit)
      .sort({ _id: -1 });
    const buys = paginateResults({after, results})
    return {
        buys,
        count,
        cursor:  buys.length ? buys[buys.length - 1].id : null,
        hasMore: buys.length
                  ? buys[buys.length - 1].id !==
                        results[results.length - 1].id
                          : false
    };
  },




  /**
   * Gets all users
   *
   * @param {string} userId
   * @param {int} skip
   * @param {int} limit
   */
  getUsers: async (_, { userId, skip, limit }, { User, Follow }) => {
    // Find user ids, that current user follows
    const userFollowing = [];
    const follow = await Follow.find({ follower: userId }, { _id: 0 }).select(
      'user'
    );
    follow.map(f => userFollowing.push(f.user));

    // Find users that user is not following
    const query = {
      $and: [{ _id: { $ne: userId } }, { _id: { $nin: userFollowing } }],
    };
    const count = await User.where(query).countDocuments();
    const users = await User.find(query)
      .populate('followers')
      .populate('following')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 'desc' });

    return { users, count };
  },





  /**
   * Searches users by username or fullName
   *
   * @param {string} searchQuery
   */
  searchUsers: async (root, { searchQuery }, { User, authUser }) => {
    // Return an empty array if searchQuery isn't presented
    if (!searchQuery) {
      return [];
    }

    const users = User.find({
      $or: [
        { username: new RegExp(searchQuery, 'i') },
        { fullName: new RegExp(searchQuery, 'i') },
      ],

      _id: {
        $ne: authUser.id,
      },

    }).limit(50);

    return users;
  },





  /**
   * Gets Suggested people for user
   *
   * @param {string} userId
   */
  suggestPeople: async (root, { userId }, { User, Follow }) => {
    const LIMIT = 6;

    // Find who user follows
    const userFollowing = [];
    const following = await Follow.find(
      { follower: userId },
      { _id: 0 }
    ).select('user');
    following.map(f => userFollowing.push(f.user));
    userFollowing.push(userId);

    // Find random users
    const query = { _id: { $nin: userFollowing } };
    const usersCount = await User.where(query).countDocuments();
    let random = Math.floor(Math.random() * usersCount);

    const usersLeft = usersCount - random;
    if (usersLeft < LIMIT) {
      random = random - (LIMIT - usersLeft);
      if (random < 0) {
        random = 0;
      }
    }

    const randomUsers = await User.find(query)
      .skip(random)
      .limit(LIMIT);

    return randomUsers;
  },




  /**
   * Verifies reset password token
   *
   * @param {string} phonenumber
   * @param {string} token
   */
  verifyResetPasswordToken: async (_, { email, token }, { User }) => {
    // Check if user exists and token is valid
    const user = await User.findOne({
      email,
      passwordResetToken: token,
      passwordResetTokenExpiry: {
        $gte: Date.now() - RESET_PASSWORD_TOKEN_EXPIRY,
      },
    });
    if (!user) {
      throw new Error('Your token is either invalid or expired!');
    }

    return { message: 'Success' };
  },
};






const Mutation = {
/* -------------------------------------------------------------------------- */
  /**
   * Signs in user existing user
   *
   * @param {string} phoneOrUsername
   * @param {string} password
   */
  signin: async (_, { phoneOrUsername, password }, { User }) => {
    const user = await User.findOne().or([
      { phonenumber: phoneOrUsername },
      { username: phoneOrUsername },
    ]);

    if (!phoneOrUsername) {
      throw new ApolloError('Provide Phone / username to login.')
    }

    if (!user) {
      throw new ApolloError(`( ${phoneOrUsername} ) has no Account.`)
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new ApolloError('Invalid password.')
    }

    return {
      token: generateToken(user, process.env.SECRET, AUTH_TOKEN_EXPIRY),
    };
  },



/* -------------------------------------------------------------------------- */
  /**
   * Signs up user new user
   *
   * @param {string} phonenumber
   * @param {string} username
   * @param {string} password
   * @param {string} confirmPassword
   */
  signup: async (
    _,
    { phonenumber, username, password , confirmPassword },
    { User }
  ) => {

  // Check if user with given phone number or username already exists
  const user = await User.findOne().or([{ phonenumber }, { username }]);
  if (user) {
    const field = user.phonenumber === phonenumber ? phonenumber : username;
    throw new Error(`( ${field} ) is taken.`);
  }

//fields validation
  if ( !username ) {
    throw new ApolloError(
        "Fill username and any other missing fields"
    )
  }

  if(!phonenumber ){
    throw new ApolloError(
        "Fill phone and any other missing fields"
    )
  }

  if(!password ){
    throw new ApolloError(
        "create a password"
    )
  }

  if (!confirmPassword ) {
    throw new ApolloError(
        "confirm your password"
    )
  }
const passwordConfrimation = password === confirmPassword
  if ( !passwordConfrimation) {
    throw new ApolloError(
        `passwords do not match`
    )
  }

   //phone validation
   const phoneRegex = /^(?:0)?((7|1)(?:(?:[1234679][0-9])|(?:0[0-8])|(4[0-1]))[0-9]{6})$/
  if(!phoneRegex.test(phonenumber)){
        throw new ApolloError(
          "Provide correct phone number."
        )
  };



    // Username validation
    const usernameRegex = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;
    if (!usernameRegex.test(username)) {
      throw new ApolloError(
        'Usernames can only use letters, numbers, underscores and periods.'
      );
    }
    if (username.length > 8) {
      throw new ApolloError('Username not more than 13 characters.');
    }
    if (username.length < 3) {
      throw new ApolloError('Username min 3 characters.');
    }
    const frontEndPages = [
      'forgot-password',
      'reset-password',
      'explore',
      'people',
      'notifications',
      'post',
    ];
    if (frontEndPages.includes(username)) {
      throw new ApolloError("This username isn't available. Please try another.");
    }

    // Password validation
    if (password.length < 6) {
      throw new ApolloError('Password min 6 characters.');
    }

    const newUser = await new User({
      phonenumber,
      username,
      password,
    }).save();

    return {
      token: generateToken(newUser, process.env.SECRET, AUTH_TOKEN_EXPIRY),
    };
  },

  /**
   * Add social links
   *
   * @param {string} id
   * @param {string} twitter
   * @param {string} instagram
   * @param {string} facebook
   */
addLinks: async(_, {id, twitter, instagram,facebook}, {User}) => {
   const user = User.findById(id);
   if(!user){
     throw new Error ("user not found")
   }

   const updatedUser = await User.findOneAndUpdate(
     { _id : id},
     {
        $set:{
          twitter,
          instagram,
          facebook,
        }
     },
     {new: true},
     null,
     function(err, docs){
        if(err){
           throw new Error(err, "update failed")
        }
        else{
          return docs
        }
     }
   )
   return {token: generateToken(updatedUser, process.env.SECRET, AUTH_TOKEN_EXPIRY),}
},


/* -------------------------------------------------------------------------- */
  /**
   * Edit  user Profile
   * @param {int} id
   * @param {string} email
   * @param {string} location
   * @param {string} fullname
   *@param {string} businessdescription
   */
editUserProfile : async (
   _,
   { id, email, businessdescription, location, fullname }, { User }) => {
   const user = User.findById(id);

   if(!user){
     throw new Error ("user not found")
   }
    /** Full name */
    if(!fullname){
      throw new ApolloError('Provide your business fullname.');
    }
    /** confairm email */
    if(!email){
      throw new ApolloError('Provide your business email.');
    }
    /** confairm business description */
    if(!businessdescription){
      throw new ApolloError('Provide your business description.');
    }
    /** Full name */
    if(!location){
      throw new ApolloError('Provide your business location.');
}

   // Email validation
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(String(email).toLowerCase())) {
      throw new Error('Enter a valid email address.');
    }

   const updatedUser = await User.findOneAndUpdate(
     { _id : id},
     {
        $set:{
          email,
          location,
          fullname,
          businessdescription,
        }
     },
     {new: true},
     null,
     function(err, docs){
        if(err){
           throw new Error(err, "update failed")
        }
        else{
          return docs
        }
     }
   )
    return {
      token: generateToken(updatedUser, process.env.SECRET, AUTH_TOKEN_EXPIRY),
    };
},





/* -------------------------------------------------------------------------- */
  /**
   * Requests reset password
   *
   * @param {string} phone
   */
  requestPasswordReset: async (_, { phone }, { User }) => {
    // Check if user exists
    const user = await User.findOne({ phone });
    if (!user) {
      throw new Error(`No such user found for phone ${phone}.`);
    }

    // Set password reset token and it's expiry
    const token = generateToken(
      user,
      process.env.SECRET,
      RESET_PASSWORD_TOKEN_EXPIRY
    );
    const tokenExpiry = Date.now() + RESET_PASSWORD_TOKEN_EXPIRY;
    await User.findOneAndUpdate(
      { _id: user.id },
      { passwordResetToken: token, passwordResetTokenExpiry: tokenExpiry },
      { new: true }
    );

    // Email user reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?email=${phonenumber}&token=${token}`;
    const mailOptions = {
      to: phone,
      subject: 'Password Reset',
      html: resetLink,
    };

    await sendEmail(mailOptions);

    // Return success message
    return {
      message: `A link to reset your password has been sent to ${email}`,
    };
  },




/* -------------------------------------------------------------------------- */
  /**
   * Resets user password
   *
   * @param {string} phonenumber
   * @param {string} token
   * @param {string} password
   */
  resetPassword: async (
    _,
    { phonenumber, token, password },
    { User }
  ) => {
    if (!password) {
      throw new Error('Enter password and Confirm password.');
    }

    if (password.length < 6) {
      throw new Error('Password min 6 characters.');
    }

    // Check if user exists and token is valid
    const user = await User.findOne({
      phonenumber,
      passwordResetToken: token,
      passwordResetTokenExpiry: {
        $gte: Date.now() - RESET_PASSWORD_TOKEN_EXPIRY,
      },
    });
    if (!user) {
      throw new Error('This token is either invalid or expired!.');
    }

    // Update password, reset token and it's expiry
    user.passwordResetToken = '';
    user.passwordResetTokenExpiry = '';
    user.password = password;
    await user.save();

    // Return success message
    return {
      token: generateToken(user, process.env.SECRET, AUTH_TOKEN_EXPIRY),
    };
  },


/* -------------------------------------------------------------------------- */
  /**
   * Uploads user Profile or Cover photo
   *
   * @param {string} id
   * @param {obj} image
   * @param {string} imagePublicId
   * @param {bool} isCover is Cover or Profile photo
   */
  uploadUserPhoto: async (_, { id, image, isCover }, { User } ) => {
//image upload logic
    let imageUrl, imagePublicId;
    if (image) {
        const imageResults = await upLoadResponse(image)
        imagePublicId = imageResults.public_id;
        imageUrl = imageResults.secure_url;
    }


    if (imageUrl && imagePublicId) {
      const fieldsToUpdate = {};
      if (isCover) {
        fieldsToUpdate.coverImage = imageUrl;
        fieldsToUpdate.coverImagePublicId = imagePublicId;
      } else {
        fieldsToUpdate.image = imageUrl;
        fieldsToUpdate.imagePublicId = imagePublicId;
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: id },
        { ...fieldsToUpdate },
        { new: true }
      )
        .populate('posts')
        .populate('likes');

      return updatedUser;
    }

    throw new Error(
      'Something went wrong while uploading image'
    );
  },
};


/* -------------------------------------------------------------------------- */
/**
 * Subscribes to user's isOnline change event
 */
const Subscription = {
  isUserOnline: {
    subscribe: withFilter(
      () => pubSub.asyncIterator(IS_USER_ONLINE),
      (payload, variables, { authUser }) => variables.authUserId === authUser.id
    ),
  },
};

export default { Query, Mutation, Subscription };
import {paginateResults} from "../utils/utils";
import { deleteFromCloudinary, upLoadResponse } from '../utils/cloudinary';
import { pubSub } from '../utils/apollo-server';
import {  NEW_POST } from '../constants/Subscriptions';


const Query = {
  /**
   * Gets all posts
   * @param {int} skip how many posts to skip
   * @param {int} limit how many posts to limit
   */
  getPosts: async (_, { skip, limit }, { Post }) => {
    // const query = {
    //   $and: [{ image: { $ne: null } }, { author: { $ne: authUserId } }],
    // };
    const allPosts = await Post.find()
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
                        { path: 'following' },
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
        populate: [
          {path: 'commentcomment'},
          { path: 'author' },
        ],
        options: { sort: { createdAt: 'desc' } },
        // populate: { path: 'author' },
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 'desc' });

    return { posts: allPosts };
  },



/* -------------------------------------------------------------------------- */
/*                               Gets paginated posts                         */
/* -------------------------------------------------------------------------- */
/**
   * @param {int} limit how many posts to limit
   * @param {int} cursor cusor
   */
getPaginatedPosts: async (_,{ limit, cursor}, {Post}) => {

  const count = await Post.find().countDocuments();
  if (limit < 1) return [];
  const results = await Post.find()
      .populate({
        path: 'author',
        populate: [
          { path: 'following' },
          { path: 'followers' },
        ],
      })
      .populate('likes')
      .populate({
        path: 'comments',
        populate: [
          {path: 'commentcomment'},
          { path: 'author' },
        ],
        options: { sort: { createdAt: 'desc' } },
        // populate: { path: 'author' },
      })
      .limit(limit)
      .sort({ _id: -1 });

    const posts = paginateResults({ cursor, results , count, limit});
  return {
    posts:results,
    count,
    cursor:  posts.length ? posts[posts.length - 1].id : null,
    hasMore: posts.length
               ? posts[posts.length - 1].id !==
                    results[count - 1].id
                       : false
  }
},

  /**
   * Gets posts from followed users
   *
   * @param {string} userId
   * @param {int} skip how many posts to skip
   * @param {int} limit how many posts to limit
   */
  getFollowedPosts: async (_, { userId, skip, limit }, { Post, Follow }) => {
    // Find user ids, that current user follows
    const userFollowing = [];
    const follow = await Follow.find({ follower: userId }, { _id: userId }).select(
      'user'
    );
    follow.map(f => userFollowing.push(f.user));

    // Find user posts and followed posts by using userFollowing ids array
    const query = {
      $or: [{ author: { $in: userFollowing } }, { author: userId }],
    };
    const followedPostsCount = await Post.find(query).countDocuments();
    const followedPosts = await Post.find(query)
      .populate({
        path: 'author',
        populate: [
          { path: 'following' },
          { path: 'followers' },
        ],
      })
      .populate('likes')
      .populate({
        path: 'comments',
        populate: [
          {path: 'commentcomment'}
        ],
        options: { sort: { createdAt: 'desc' } },
        populate: { path: 'author' },
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 'desc' });

    return { posts: followedPosts, count: followedPostsCount };
  },



 /* -------------------------------------------------------------------------- */
 /**
   * Searches posts by search query
   *
   * @param {string} searchQuery
   */
  searchPosts: async (_, { searchQuery }, { Post, authUser }) => {
    // Return an empty array if searchQuery isn't presented
    if (!searchQuery) {
      return [];
    }

    const posts = Post.find({
      $or: [
        { title: new RegExp(searchQuery, 'i') },
        { price: new RegExp(searchQuery, 'i') },
        { description: new RegExp(searchQuery, 'i') },
      ],

      _id: {
        $ne: authUser.id,
      },
    }).limit(50);

    return posts;
  },
/* -------------------------------------------------------------------------- */




  /**
   *
   *Gets post by id
   * @param {string} id
   */
  getPost: async (_, { id }, { Post }) => {
    const post = await Post.findById(id)
      .populate({
        path: 'author',
        populate: [
          { path: 'following' },
          { path: 'followers' },
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
        populate: [
          { path: 'author' },
          { path: 'commentcomment' }
        ],
        options: { sort: { createdAt: -1 } },
      });
    return post;
  },
};



const Mutation = {
  /* -------------------------------------------------------------------------- */
  /**
   * Creates a new post
   * @param {string} title
   * @param {string} description
   * @param {string} features
   * @param {string} location
   *
   * @param {string} crossedPrice
   * @param {string} price
   *
   * @param {string} image
   * @param {string} authorId
   */
  createPost: async (
    _,
    {  title, description,features, price, crossedPrice, image, location, authorId }, { Post, User}) => {
    if (!title && !image && !price) {
      throw new Error('Give a picture and description of your item.');
    }
    if (!title && !image && price) {
      throw new Error('Provide a description/item');
    }
    if (price.length > 9) {
      throw new Error("You can only display items bellow Ksh. 999,999,999");
    }

//image upload logic
    let imageUrl, imagePublicId;
    if (image) {
        const imageResults = await upLoadResponse(image)
        imagePublicId = imageResults.public_id;
        imageUrl = imageResults.secure_url;
    }


    const newPost = await new Post({
      title,
      description,
      features,
      location,
      price,
      crossedPrice,
      image: imageUrl,
      imagePublicId,
      author: authorId,
    }).save();

    pubSub.publish(NEW_POST, {
       newPost: newPost
    })
/* -------------------------------------------------------------------------- */

// find a user from model and update post field
    await User.findOneAndUpdate(
      { _id: authorId },
      { $push: { posts: newPost.id } }
    );

    return newPost;
  },



/* -------------------------------------------------------------------------- */
  /**
   * Updates user Post
   * @param {string} title
   * @param {string} description
   * @param {string} features
   * @param {string} price
   * @param {string} crossedPrice
   * @param {string} authorId
   */
updatePost : async (
   _,
   { title, description,features,inStock, price, crossedPrice, postId }, { Post }) => {
   const post = Post.findById(postId);
   console.log(Post)
   if(!post){
     throw new Error ("Post not found")
   }
   const updatedPost = await Post.findOneAndUpdate(
     { _id : postId},
     {
        title: title,
        description: description,
        price: price,
        features: features,
        crossedPrice: crossedPrice,
        inStock: inStock
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

    pubSub.publish(NEW_POST, {
       newPost: updatedPost
    })

   return updatedPost
},

/* -------------------------------------------------------------------------- */
  /**
   * Deletes a user post
   * @param {string} id
   * @param {imagePublicId} id
   */
  deletePost: async (_,{ id, imagePublicId },{ Post, Like, User, Comment, Notification }) => {
    // Remove post image from cloudinary, if imagePublicId is present
    if (imagePublicId) {
      const deleteImage = await deleteFromCloudinary(imagePublicId);

      if (deleteImage.result !== 'ok') {
        throw new Error(
          'Something went wrong while deleting item from Cloudinary'
        );
      }
    }

// Find post and remove it
 const post = await Post.findByIdAndRemove(id);
    // Delete post from authors (users) posts collection
    await User.findOneAndUpdate(
      { _id: post.author},
      { $pull: { posts: post.id } }
    );


// Delete post likes from likes collection
    await Like.find({ post: post.id }).deleteMany();
    // Delete post likes from users collection
    post.likes.map(async likeId => {
      await User.where({ likes: likeId }).updateMany({ $pull: { likes: likeId } });
    });


// Delete post comments from comments collection
    await Comment.find({ post: post.id }).deleteMany();
    // Delete comments from users collection
    post.comments.map(async commentId => {
      await User.where({ comments: commentId }).updateMany({
        $pull: { comments: commentId },
      });
    });


    // Find user notification in users collection and remove them
    const userNotifications = await Notification.find({ post: post.id });

    userNotifications.map(async notification => {
      await User.where({ notifications: notification.id }).update({
        $pull: { notifications: notification.id },
      });
    });
    // Remove notifications from notifications collection
    await Notification.find({ post: post.id }).deleteMany();

    return post;
  },
};



/* -------------------------------------------------------------------------- */
/**
 * Subscribes to new post event
 */
const Subscription = {
  newPost : {
    // subscribe: ()  => pubSub.asyncIterator("NEW_POST"),
    subscribe: () => pubSub.asyncIterator("NEW_POST")
  }

};


export default { Query, Mutation, Subscription };

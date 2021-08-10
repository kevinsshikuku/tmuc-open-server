import {paginateResults} from "../utils/utils";
import { deleteFromCloudinary } from '../utils/cloudinary';

const Query = {
  /**
   * Gets all buys
   * @param {int} skip how many buys to skip
   * @param {int} limit how many buys to limit
   */
  getBuys: async (_, { skip, limit }, { Buy }) => {
    // const query = {
    //   $and: [{ image: { $ne: null } }, { author: { $ne: authUserId } }],
    // };
    const buysCount = await Buy.find().countDocuments();
    const allBuys = await Buy.find()
      .populate({
        path: 'author',
        populate: [
          { path: 'following' },
          { path: 'followers' },
          {
            path: 'notifications',
            populate: [
              { path: 'author' },
              { path: 'follow' },
              { path: 'like' },
              { path: 'comment' },
            ],
          },
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
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 'desc' });

    return { buys: allBuys, count: buysCount };
  },





/* -------------------------------------------------------------------------- */
/*                               Gets paginated buys                         */
/* -------------------------------------------------------------------------- */
/**
   * @param {int} skip how many buys to skip
   * @param {int} limit how many buys to limit
   * @param {int} cursor cusor
   */
getPaginatedBuys: async (_,{ limit, after}, {Buy}) => {

  const count = await Buy.find().countDocuments();
  if (limit < 1) return [];
  const results = await Buy.find()
      .populate({
        path: 'author',
        populate: [
          { path: 'following' },
          { path: 'followers' },
          {
            path: 'notifications',
            populate: [
              { path: 'author' },
              { path: 'follow' },
              { path: 'like' },
              { path: 'comment' },
            ],
          },
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
      .sort({ _id: -1 })
      .limit(limit);

    const buys = paginateResults({after, results, count });

  return {
    buys,
    count,
    cursor:  buys.length ? buys[buys.length - 1].id : null,
    hasMore: buys.length
               ? buys[buys.length - 1].id !==
                    results[results.length - 1].id
                       : false
  }
},





  /**
   * Gets buys from followed users
   *
   * @param {string} userId
   * @param {int} skip how many buys to skip
   * @param {int} limit how many buys to limit
   */
  getFollowedBuys: async (_, { userId, skip, limit }, { Buy, Follow }) => {
    // Find user ids, that current user follows
    const userFollowing = [];
    const follow = await Follow.find({ follower: userId }, { _id: userId }).select(
      'user'
    );
    follow.map(f => userFollowing.push(f.user));

    // Find user buys and followed buys by using userFollowing ids array
    const query = {
      $or: [{ author: { $in: userFollowing } }, { author: userId }],
    };
    const followedBuysCount = await Buy.find(query).countDocuments();
    const followedBuys = await Buy.find(query)
      .populate({
        path: 'author',
        populate: [
          { path: 'following' },
          { path: 'followers' },
          {
            path: 'notifications',
            populate: [
              { path: 'author' },
              { path: 'follow' },
              { path: 'like' },
              { path: 'comment' },
            ],
          },
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

    return { buys: followedBuys, count: followedBuysCount };
  },





 /* -------------------------------------------------------------------------- */
 /**
   * Searches buys by search query
   *
   * @param {string} searchQuery
   */
  searchBuys: async (_, { searchQuery }, { Buy, authUser }) => {
    // Return an empty array if searchQuery isn't presented
    if (!searchQuery) {
      return [];
    }

    const buys = Buy.find({
      $or: [
        { title: new RegExp(searchQuery, 'i') },
        { price: new RegExp(searchQuery, 'i') },
        { description: new RegExp(searchQuery, 'i') },
      ],

      _id: {
        $ne: authUser.id,
      },
    }).limit(50);

    return buys;
  },
/* -------------------------------------------------------------------------- */




  /**
   *
   *Gets post by id
   * @param {string} id
   */
  getBuy: async (_, { id }, { Buy }) => {
    const buy = await Buy.findById(id)
      .populate({
        path: 'author',
        populate: [
          { path: 'following' },
          { path: 'followers' },
          {
            path: 'notifications',
            populate: [
              { path: 'author' },
              { path: 'follow' },
              { path: 'like' },
              { path: 'comment',
                populate: [
                  {path: 'commentcomment'}
                ]
               },
            ],
          },
        ],
      })
      .populate('likes')
      .populate({
        path: 'comments',
        populate: [
          { path: 'author' },
          { path: 'commentcomment' }
        ],
        options: { sort: { createdAt: -1 } },
      });
    return buy;
  },
};



const Mutation = {
  /* -------------------------------------------------------------------------- */
  /**
   * Creates a new buy
   * @param {string} title
   * @param {string} description
   * @param {string} features
   * @param {string} location
   *
   * @param {string} pricerange
   */
  createBuy: async (
    _,
    {  title, description, features, pricerange, location, authorId }, { Buy, User }) => {
    if (!title ) {
      throw new Error('Name what you want to buy');
    }
    if (pricerange.length > 12) {
      throw new Error("set a resonable price range");
    }


    const newBuy = await new Buy({
      title,
      description,
      features,
      location,
      pricerange,
      author: authorId,
    }).save();

    await User.findOneAndUpdate(
      { _id: authorId },
      { $push: { buys: newBuy.id } }
    );

    return newBuy;
  },



/* -------------------------------------------------------------------------- */
  /**
   * Updates user Buy
   * @param {string} title
   * @param {string} description
   * @param {string} features
   * @param {string} price
   * @param {string} crossedPrice
   * @param {string} authorId
   */
updateBuy : async (
   root,
   { title, description,features, price, crossedPrice, buyId }, { Buy }) => {
   const buy = Buy.findById(buyId)
   if(!buy){
     throw new Error ("Buy not found")
   }
   const updatedBuy = await Buy.findOneAndUpdate(
     { _id : buyId},
     {
        title: title,
        description: description,
        price: price,
        features: features,
        crossedPrice: crossedPrice
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
return updatedBuy
},

/* -------------------------------------------------------------------------- */
  /**
   * Deletes a user buy
   * @param {string} id
   * @param {imagePublicId} id
   */
  deleteBuy: async (_,{ id, imagePublicId },{ Buy, Like, User, Comment, Notification }) => {
    // Remove buy image from cloudinary, if imagePublicId is present
    if (imagePublicId) {
      const deleteImage = await deleteFromCloudinary(imagePublicId);

      if (deleteImage.result !== 'ok') {
        throw new Error(
          'Something went wrong while deleting item from Cloudinary'
        );
      }
    }

// Find buy and remove it
 const buy = await Buy.findByIdAndRemove(id);
    // Delete buy from authors (users) buys collection
    await User.findOneAndUpdate(
      { _id: buy.author},
      { $pull: { buys: buy.id } }
    );


// Delete buy likes from likes collection
    await Like.find({ buy: buy.id }).deleteMany();
    // Delete buy likes from users collection
    buy.likes.map(async likeId => {
      await User.where({ likes: likeId }).updateMany({ $pull: { likes: likeId } });
    });


// Delete buy comments from comments collection
    await Comment.find({ buy: buy.id }).deleteMany();
    // Delete comments from users collection
    buy.comments.map(async commentId => {
      await User.where({ comments: commentId }).updateMany({
        $pull: { comments: commentId },
      });
    });


    // Find user notification in users collection and remove them
    const userNotifications = await Notification.find({ buy: buy.id });

    userNotifications.map(async notification => {
      await User.where({ notifications: notification.id }).update({
        $pull: { notifications: notification.id },
      });
    });
    // Remove notifications from notifications collection
    await Notification.find({ buy: buy.id }).deleteMany();

    return buy;
  },
};

export default { Query, Mutation };

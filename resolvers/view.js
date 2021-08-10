const Mutation = {
  /**
   * Creates view
   * @param {string} userId
   * @param {string} postId
   */
  createView: async ( _,{userId, postId }, { View, Post, User }) => {
    const view = await new View({ user: userId, post: postId }).save();

    // Push view to post collection
    await Post.findOneAndUpdate({ _id: postId }, { $push: { views: view.id } });

    // Push vie to user collection
    await User.findOneAndUpdate({ _id: userId }, { $push: { views: view.id } });
    console.log(view)
    return view;
  },
};
export default { Mutation };
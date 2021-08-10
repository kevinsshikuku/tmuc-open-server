import userResolver from './user';
import postResolver from './post';
import buyResolver from './buy';
import likeResolver from './like';
import followResolver from './follow';
import commentResolver from './comment';
import message from './message';

export default [
  userResolver,
  postResolver,
  buyResolver,
  likeResolver,
  followResolver,
  commentResolver,
  message,
];

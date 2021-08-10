import { gql } from 'apollo-server-express';

import UserSchema from './User';
import BuySchema from './Buy';
import PostSchema from './Post';
import MessageSchema from './Message';
import LikeSchema from './Like';
import FollowSchema from './Follow';
import CommentSchema from './Comment';
import ViewSchema from './View';

const schema = gql`
  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }

  ${UserSchema}
  ${PostSchema}
  ${BuySchema}
  ${MessageSchema}
  ${FollowSchema}
  ${LikeSchema}
  ${CommentSchema}
  ${ViewSchema}
`;
export default schema;
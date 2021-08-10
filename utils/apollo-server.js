import jwt from 'jsonwebtoken';
import { ApolloServer } from 'apollo-server-express';
import { PubSub } from 'apollo-server-express';
import { request } from 'express';



// Export pubSub instance for publishing events
/** Subscriptions to live data */
export const pubSub = new PubSub();

/**
 * Checks if client is authenticated by checking authorization key from req headers
 *
 * @param {obj} req
 */




const checkAuthorization = auth => {
  if(auth){
    try{
        const authUser =  jwt.verify(auth, process.env.SECRET);
        if(authUser){
          return authUser;
        }else{
          throw new Error("Couldn't authenticate user")
        }
    }catch(err){
      throw new Error(err)
    }
  }
}

/**
 * Creates an Apollo server and identifies if user is authenticated or not
 *
 * @param {obj} schema GraphQL Schema
 * @param {array} resolvers GraphQL Resolvers
 * @param {obj} models Mongoose Models
 */
export const createApolloServer = (schema, resolvers, models) => {
  return new ApolloServer({
    typeDefs: schema,
    resolvers,
    introspection: true,
    context: async({ req, connection }) => {
      if (connection) {
        return connection.context;
      }

      let authUser;
      if (req.headers.authorization !== "null") {
        console.log(request.headers)
        const auth = req.headers.authorization;
        const user =  await checkAuthorization(auth);
        if (user) {
            authUser = user;
        }
      }

      return Object.assign({ authUser }, models, pubSub);
    }
  });
};


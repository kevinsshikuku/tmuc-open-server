import dotenv from 'dotenv'
import express from 'express';
import { createServer } from 'http';
import mongoose from 'mongoose';
import cors from "cors";

import models from './models';
import schema from './schema';
import resolvers from './resolvers';
import { createApolloServer } from './utils/apollo-server';
dotenv.config();


/* ----------Connect to database---------------------------------------------------------------- */
mongoose.set('useFindAndModify', false);
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useNewUrlParser: true
  })
  .then(() => console.log('DB connected'))
  .catch(err => console.error(err));

// Initializes application
const app = express();


/**  Enables cors */
const corsOptions = {
  origin: "*",
  credentials: true  // <-- REQUIRED backend setting
};

app.use(cors(corsOptions))

/* -----------Create a Apollo Server--------------------------------------------------------------- */
const server = createApolloServer(schema, resolvers, models);
server.applyMiddleware({
          app,
          path:'/graphql',
          cors:false ,
          bodyParserConfig: {
            limit:"50mb"
          }
          });


// Create http server and add subscriptions to it
const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

// Listen to HTTP and WebSocket server
const PORT = process.env.PORT || process.env.API_PORT;
httpServer.listen(PORT, () => {
  console.log(`windoshoppe server ready at http://localhost:${PORT}${server.graphqlPath}`);
  console.log(`Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`);
});
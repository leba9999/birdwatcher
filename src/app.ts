require('dotenv').config();
import express from 'express';
import api from './api';
import helmet from 'helmet';
import cors from 'cors';
import {ApolloServer} from '@apollo/server';
import {expressMiddleware} from '@apollo/server/express4';
import typeDefs from './api/schemas/index';
import resolvers from './api/resolvers/index';
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from '@apollo/server/plugin/landingPage/default';
import {notFound, errorHandler} from './middlewares';
import {applyMiddleware} from 'graphql-middleware';
import {makeExecutableSchema} from '@graphql-tools/schema';
import {createRateLimitRule} from 'graphql-rate-limit';
import {allow, shield} from 'graphql-shield';
import authenticate from './api/functions/authenticate';
import { MyContext } from './interfaces/MyContext';

const app = express();
app.use(cors<cors.CorsRequest>());
app.use(express.json());

(async () => {
  try {
    const rateLimitRule = createRateLimitRule({
      identifyContext: (ctx) => ctx.id,
    });

    const permissions = shield({
      Mutation: {
        login: rateLimitRule({window: '1s', max: 10}),
        register: rateLimitRule({window: '1s', max: 3}),
      },
    },
    {
      allowExternalErrors: true
    });

    const schema = applyMiddleware(
      makeExecutableSchema({
        typeDefs,
        resolvers,
      }),
      permissions
    );

    app.use(
      helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: false,
      })
    );
    const server = new ApolloServer<MyContext>({
      schema,
      introspection: true,
      plugins: [
        process.env.NODE_ENV === 'production'
          ? ApolloServerPluginLandingPageProductionDefault({
              embed: true as false,
            })
          : ApolloServerPluginLandingPageLocalDefault(),
      ],
      includeStacktraceInErrorResponses: true,
    });
    await server.start();

    app.use(
      '/graphql',
      express.json(),
      cors<cors.CorsRequest>(),
      expressMiddleware(server, {
        context: async ({req}) => authenticate(req),
      })
    );

    app.use('/api/v1', api);
    app.use(notFound);
    app.use(errorHandler);
  } catch (error) {
    console.log(error);
  }
})();

export default app;
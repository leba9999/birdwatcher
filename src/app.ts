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
import {shield} from 'graphql-shield';

const app = express();
app.use(express.json());

(async () => {
  try {
    const rateLimitRule = createRateLimitRule({
      identifyContext: (ctx) => ctx.id,
    });

    const permissions = shield({
      Mutation: {
        login: rateLimitRule({window: '1s', max: 10}),
      },
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
    const server = new ApolloServer({
      schema,
      introspection: true,
      plugins: [
        process.env.ENVIRONMENT === 'production'
          ? ApolloServerPluginLandingPageProductionDefault({
              graphRef: 'my-graph-id@my-graph-variant',
              footer: false,
            })
          : ApolloServerPluginLandingPageLocalDefault({footer: false}),
      ],
      includeStacktraceInErrorResponses: false,
    });
    await server.start();

    app.use(
      '/graphql',
      cors<cors.CorsRequest>(),
      express.json(),
      expressMiddleware(server)
    );

    app.use('/api/v1', api);
    app.use(notFound);
    app.use(errorHandler);
  } catch (error) {
    console.log(error);
  }
})();

export default app;
require("dotenv").config();
import express from "express";
import api from "./api";
import helmet from "helmet";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import typeDefs from "./api/schemas/index";
import resolvers from "./api/resolvers/index";
import {
  ApolloServerPluginLandingPageLocalDefault,
  ApolloServerPluginLandingPageProductionDefault,
} from "@apollo/server/plugin/landingPage/default";
import { notFound, errorHandler } from "./middlewares";
import { applyMiddleware } from "graphql-middleware";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { createRateLimitRule } from "graphql-rate-limit";
import { shield } from "graphql-shield";
import authenticate from "./api/functions/authenticate";
import { MyContext } from "./interfaces/MyContext";
import path from "path";
import mime from "mime-types";

const app = express();
app.use(cors<cors.CorsRequest>());
app.use(express.json());

(async () => {
  try {
    const rateLimitRule = createRateLimitRule({
      identifyContext: (ctx) => ctx.id,
    });

    const permissions = shield(
      {
        Mutation: {
          login: rateLimitRule({ window: "1s", max: 10 }),
          register: rateLimitRule({ window: "1s", max: 3 }),
        },
      },
      {
        allowExternalErrors: true,
      }
    );

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
        process.env.NODE_ENV === "production"
          ? ApolloServerPluginLandingPageProductionDefault({
              embed: true as false,
            })
          : ApolloServerPluginLandingPageLocalDefault(),
      ],
      includeStacktraceInErrorResponses: true,
    });
    await server.start();

    app.use(
      "/graphql",
      express.json(),
      cors<cors.CorsRequest>(),
      expressMiddleware(server, {
        context: async ({ req }) => authenticate(req),
      })
    );

    app.use("/api/v1", api);
    app.use(cors());
    app.use(
      "/uploads",
      express.static("./uploads", {
        setHeaders: (res, path, stat) => {
          res.set("Cross-Origin-Resource-Policy", "cross-origin");
        },
      })
    );
    app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });
    app.get("/app", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });
    app.get("/register", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });
    app.get("/profile", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });
    app.get("/profile/edit", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });
    app.get("/:id", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });
    app.get("/user/:id", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });
    app.get("/edit/:id", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });
    app.get("/new", (req, res) => {
      res.sendFile(path.join(__dirname, "public", "index.html"));
    });
    app.use(
      "/",
      express.static(path.join(__dirname, "public"), {
        setHeaders: function (res, path) {
          const mimeType = mime.lookup(path);
          if (mimeType) {
            res.setHeader("Content-Type", mimeType);
          }
        },
      })
    );
    app.use("/", express.static(path.join(__dirname, "public")));
    app.use("/", express.static(__dirname + "/public"));
    app.use(notFound);
    app.use(errorHandler);
  } catch (error) {
    console.log(error);
  }
})();

export default app;

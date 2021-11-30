import "reflect-metadata";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./Resolvers/PostsResolver";

const start = async () => {
  const schema = await buildSchema({ resolvers: [PostResolver] });
  const server = new ApolloServer({ schema });

  const { url } = await server.listen(4000);
  console.log(`Server is running, GraphQL Playground available at ${url}`);
};

start();

import "reflect-metadata";
import { ApolloServer, gql } from "apollo-server";
import { buildSchema } from "type-graphql";
import { PostResolver } from "./Resolvers/PostsResolver";

let server: ApolloServer;

beforeAll(async () => {
  const schema = await buildSchema({
    resolvers: [PostResolver],
  });
  server = new ApolloServer({
    schema,
    subscriptions: { path: "/subscriptions" },
  });
});

describe("first test", () => {
  it("runs a test", async () => {
    const res = await server.executeOperation({
      query: gql`
        query GetAllPosts {
          posts {
            content
          }
        }
      `,
    });
    expect(res.data?.posts).toEqual([]);
  });
});

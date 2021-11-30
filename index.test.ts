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

describe("post resolver", () => {
  it("posts are empty", async () => {
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
  it("create and fetch first post", async () => {
    await server.executeOperation({
      query: gql`
        mutation CreatePost {
          addNewPost(newPostData: { content: "lala" }) {
            content
          }
        }
      `,
    });
    const res = await server.executeOperation({
      query: gql`
        query GetAllPosts {
          posts {
            content
          }
        }
      `,
    });
    expect(res.data?.posts).toEqual([{ content: "lala" }]);
  });
});

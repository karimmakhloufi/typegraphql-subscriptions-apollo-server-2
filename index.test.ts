import "reflect-metadata";
import { ApolloServer, gql } from "apollo-server";
import { buildSchema } from "type-graphql";
import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  split,
} from "@apollo/client/core";
import fetch from "cross-fetch";
import { WebSocketLink } from "@apollo/client/link/ws";
import ws from "ws";
import { getMainDefinition } from "@apollo/client/utilities";

import { PostResolver } from "./Resolvers/PostsResolver";

let server: ApolloServer;
let client: ApolloClient<unknown>;

beforeAll(async () => {
  const schema = await buildSchema({
    resolvers: [PostResolver],
  });
  server = new ApolloServer({
    schema,
    subscriptions: { path: "/subscriptions" },
  });
  await server.listen(4001);
  const wsLink = new WebSocketLink({
    uri: "ws://localhost:4001/subscriptions",
    options: {
      reconnect: true,
    },
    webSocketImpl: ws,
  });
  const httpLink = new HttpLink({
    uri: "http://localhost:4001/graphql",
    fetch,
  });
  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === "OperationDefinition" &&
        definition.operation === "subscription"
      );
    },
    wsLink,
    httpLink
  );
  client = new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
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

  it("subscription integration test", async () => {
    client
      .subscribe({
        query: gql`
          subscription GetNewPosts {
            newPost {
              content
            }
          }
        `,
      })
      .subscribe({
        next(data) {
          expect(data.data.newPost.content).toBe("lala");
        },
        error(err) {
          console.log("error", err);
        },
      });

    client.mutate({
      mutation: gql`
        mutation CreatePost {
          addNewPost(newPostData: { content: "lala" }) {
            content
          }
        }
      `,
    });
  });
});

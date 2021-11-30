import { PubSubEngine } from "graphql-subscriptions";
import {
  Arg,
  Mutation,
  PubSub,
  Query,
  Resolver,
  Root,
  Subscription,
} from "type-graphql";
import { Post } from "../Entities/Post";
import { PostInput } from "../Inputs/PostInput";

const posts: Post[] = [];

@Resolver(Post)
export class PostResolver {
  @Query(() => [Post])
  posts() {
    return posts;
  }

  @Mutation(() => Post)
  async addNewPost(
    @Arg("newPostData") newPostData: PostInput,
    @PubSub() pubSub: PubSubEngine
  ) {
    posts.push(newPostData);
    await pubSub.publish("NEW_POST", newPostData);
    return newPostData;
  }

  @Subscription({ topics: "NEW_POST" })
  newPost(@Root() newPostPayload: Post): Post {
    return newPostPayload;
  }
}

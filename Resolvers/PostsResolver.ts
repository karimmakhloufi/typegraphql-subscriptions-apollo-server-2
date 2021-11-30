import { Arg, Mutation, Query, Resolver } from "type-graphql";
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
  newPost(@Arg("newPostData") newPostData: PostInput) {
    posts.push(newPostData);
    return newPostData;
  }
}

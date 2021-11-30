import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class Post {
  @Field()
  content: string;
}

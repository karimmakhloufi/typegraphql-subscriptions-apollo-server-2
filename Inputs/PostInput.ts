import { Field, InputType } from "type-graphql";

@InputType()
export class PostInput {
  @Field()
  content: string;
}

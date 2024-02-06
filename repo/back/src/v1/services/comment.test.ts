import { describe, test, beforeEach, expect } from "bun:test";
import { config } from "dotenv";
import { createGlobalLogger } from "logger";
import db from "prisma";
import { comment } from ".";

config();

const testLogger = createGlobalLogger(
  "CommentTestLogger",
  process.env.TEST_LOG !== "true"
);

beforeEach(async () => {
  await db.comment.deleteMany();
  await db.post.deleteMany();
});

const commentContent = {
  name: "TestComment",
  password: "TestCommentPassword",
  message: "Test Comment",
  locale: "EN" as const,
};

describe("Comment", () => {
  describe("createComment", () => {
    test("Create comment", async () => {
      const post = await db.post.create({
        data: {},
      });
      const createdComment = await comment.createComment(testLogger, {
        ...commentContent,
        postId: post.id,
      });
      const afterPost = await db.post.findUnique({
        where: { id: post.id },
        select: {
          _count: {
            select: {
              comments: true,
            },
          },
        },
      });
      const afterComment = await db.comment.findUnique({
        where: {
          id: createdComment.id,
        },
      });
      expect(afterPost?._count.comments).toBe(1);
      expect(afterComment?.name).toBe(commentContent.name);
      expect(afterComment?.password).toBe(commentContent.password);
      expect(afterComment?.message).toBe(commentContent.message);
      expect(afterComment?.locale).toBe(commentContent.locale);
    });
  });
});

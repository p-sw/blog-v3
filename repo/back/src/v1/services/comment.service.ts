import db, { Prisma } from "prisma";
import { Logger } from "winston";
/*



*/
// SECTION 댓글
// SECTION Create
/**
 * * 댓글 생성
 *
 * @in 댓글 내용, 로캘과 포스트 ID
 * @out 댓글 ID
 */
export async function createComment(
  logger: Logger,
  { postId, locale, ...content }: createComment.In
): Promise<createComment.Out> {
  const createdComment = await db.comment.create({
    data: {
      postId,
      locale,
      ...content,
    },
    select: {
      id: true,
    },
  });

  logger.info(`Created comment ${createdComment.id}`);

  return createdComment;
}

export namespace createComment {
  export interface In {
    name: string;
    password: string;
    message: string;
    parentId?: string;
    locale: Prisma.Locale;
    postId: number;
  }
  export interface Out {
    id: string;
  }
}
// !SECTION
/*



*/
// SECTION Read
/**
 * * 댓글 탐색
 *
 * @in 탐색 조건
 * @out 댓글 내용
 */
export async function getComments(
  logger: Logger,
  { page, limit, postId, locale, sortby }: getComments.In
): Promise<getComments.Out> {
  const counted = await db.comment.count({
    where: {
      postId,
      locale,
    },
  });
  const maxPage = Math.ceil(counted / limit);

  logger.info(
    `Found ${counted} comments (max ${maxPage} page with ${limit} limit)`
  );

  const found = (
    await db.comment.findMany({
      where: {
        postId,
        locale,
      },
      orderBy: {
        createdAt: (<getComments.SortDict>{
          oldest_first: "asc",
          youngest_first: "desc",
        })[sortby],
      },
      skip: page * limit,
      take: limit,
    })
  ).map((c) => ({ ...c, isUpdated: c.createdAt !== c.updatedAt }));

  logger.info(`Found total ${found.length} comments`);

  return {
    comments: found,
    maxPage,
  };
}

export namespace getComments {
  export type SortBy = "oldest_first" | "youngest_first";
  export type SortDict = Record<SortBy, "desc" | "asc">;
  export interface In {
    page: number;
    limit: number;
    postId: number;
    locale?: Prisma.Locale;
    sortby: SortBy;
  }

  export interface Out {
    comments: (Prisma.Comment & { isUpdated: boolean })[];
    maxPage: number;
  }
}
// !SECTION
/*



*/
// SECTION Update
/**
 * * 댓글 수정
 *
 * 댓글 비밀번호 확인
 *
 * @in 댓글 ID와 비밀번호, 메시지 수정사항
 * @out 비밀번호 인증 성공 여부와 댓글 ID
 */
export async function updateComment(
  logger: Logger,
  { commentId, message, password }: updateComment.In
): Promise<updateComment.Out> {
  const counted = await db.comment.count({
    where: {
      id: commentId,
      password,
    },
  });

  if (counted <= 0) {
    logger.warn(`Invalid comment id or password`);
    return { ok: false, id: commentId };
  }

  const updatedComment = await db.comment.update({
    where: {
      id: commentId,
      password,
    },
    data: {
      message,
    },
    select: {
      id: true,
    },
  });

  return {
    ok: true,
    id: updatedComment.id,
  };
}

export namespace updateComment {
  export interface In {
    commentId: string;
    password: string;
    message: string;
  }
  export interface Out {
    ok: boolean;
    id: string;
  }
}
// !SECTION
/*



*/
// SECTION Delete
/**
 * * 댓글 삭제
 *
 * @in 삭제 조건
 * @out 개별 삭제 시 비밀번호 일치 여부
 */
export async function deleteComment(
  logger: Logger,
  In: deleteComment.UniqueIn
): Promise<deleteComment.UniqueOut>;
export async function deleteComment(
  logger: Logger,
  In: deleteComment.AllIn
): Promise<void>;
export async function deleteComment(logger: Logger, In: any): Promise<any> {
  if ("postId" in In) {
    await db.comment.deleteMany({
      where: {
        postId: In.postId,
      },
    });
    logger.info(`Deleted all comment in post ${In.postId}`);
    return;
  } else {
    const counted = await db.comment.count({
      where: {
        id: In.commentId,
        password: In.password,
      },
    });
    if (counted <= 0) {
      logger.warn(`Invalid comment id or password`);
      return {
        password: false,
      };
    }

    await db.comment.delete({
      where: {
        id: In.commentId,
        password: In.password,
      },
    });

    logger.info(`Deleted comment ${In.commentId}`);

    return {
      password: true,
    };
  }
}

export namespace deleteComment {
  export interface UniqueIn {
    commentId: string;
    password: string;
  }
  export interface AllIn {
    postId: string;
  }
  export interface UniqueOut {
    password: boolean;
  }
}
// !SECTION
// !SECTION

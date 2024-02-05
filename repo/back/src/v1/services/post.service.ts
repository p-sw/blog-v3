import db, { Prisma } from "prisma";
import { Logger } from "winston";
/*

------------------------------

*/
// SECTION 포스트
/*

*/
// SECTION Create

// SECTION 포스트 생성
// SECTION Function
/**
 * * 포스트 생성
 *
 * @in 포스트 메타데이터
 * @out 포스트 ID
 */
export async function createPost(
  logger: Logger,
  { seriesId, published = false }: createPost.In
): Promise<createPost.Out> {
  const createdPost = await db.post.create({
    data: {
      seriesId,
      published,
      publishedAt: new Date(),
    },
  });

  logger.info(
    `Created post ${createdPost.id} - ${published ? "" : "not"} published, ${seriesId ? "series " + seriesId : "not series"}`
  );

  await db.commentDelta.create({
    data: {
      inc_num: 0,
      postId: createdPost.id,
    },
  });
  logger.info(`Initialized comment delta for post ${createdPost.id}`);

  await db.viewDelta.create({
    data: {
      inc_num: 0,
      postId: createdPost.id,
    },
  });
  logger.info(`Initialized view delta for post ${createdPost.id}`);

  return {
    postId: createdPost.id,
  };
}
// !SECTION Function
// SECTION Namespace
export namespace createPost {
  export interface In {
    seriesId?: number;
    published?: boolean;
  }

  export interface Out {
    postId: number;
  }
}
// !SECTION Namespace
// !SECTION 포스트 생성

// !SECTION Create
/*

*/
// SECTION Read

// SECTION 포스트 탐색
// SECTION Function
/**
 * * 포스트 탐색
 *
 * @in 검색할 포스트 정보
 * @out 포스트 객체
 */
export async function getPost(
  logger: Logger,
  In: getPost.UniqueIn
): Promise<getPost.UniqueOut>;
export async function getPost(
  logger: Logger,
  In: getPost.ManyIn
): Promise<getPost.ManyOut>;
export async function getPost(logger: Logger, In: any): Promise<any> {
  if ("unique" in In) {
    const q = In.unique;
    logger.info(`Searching unique post ${q.postId}`);
    const post = await db.post.findUnique({
      where: { id: q.postId },
    });
    if (!post) {
      logger.warn("Post not found");
    }
    return post;
  } else if ("many" in In) {
    const q = In.many;
    logger.info(
      `Searching many posts (page ${q.page} limit ${q.limit} ${q.tags ? "tags " + q.tags.length : ""})`
    );
    const postCount = q.tags
      ? (
          await db.post.findMany({
            where: {
              seriesId: q.seriesId,
              published: q.published,
              tag: {
                some: {
                  tagId: {
                    in: q.tags,
                  },
                },
              },
            },
            select: {
              tag: {
                select: {
                  tagId: true,
                },
              },
            },
          })
        ).filter(({ tag }) => {
          const tags = tag.map(({ tagId }) => tagId);
          return q.tags.every((qtag: number) => tags.includes(qtag));
        }).length
      : await db.post.count({
          where: {
            seriesId: q.seriesId,
            published: q.published,
          },
        });
    const maxPage = Math.ceil(postCount / q.limit);
    logger.info(
      `Found posts ${
        q.seriesId || q.published
          ? "with" +
            [
              q.seriesId ? " seriesId=" + q.seriesId : "",
              q.published ? " published=" + q.published : "",
            ].join(", ")
          : ""
      }: ${postCount} posts (max ${maxPage} page with limit ${q.limit})`
    );

    let posts: Prisma.Post[] = [];

    const orderBy = q.sortby?.updatedAt
      ? {
          updatedAt: q.sortby.updatedAt
            ? (<getPost.SortOrderDict>{
                youngest_first: "desc",
                oldest_first: "asc",
              })[q.sortby.updatedAt as getPost.ManySortUpdatedAt]
            : undefined,
          views: q.sortby.views
            ? (<getPost.SortOrderDict>{
                many_first: "desc",
                few_first: "asc",
              })[q.sortby.views as getPost.ManySortViews]
            : undefined,
        }
      : undefined;

    if (q.tags) {
      logger.info(`Trying tag filtering`);
      // maxPage === 0 (postCount === 0), q.page === 1 case
      let tried = 0;
      while (
        (q.page >= maxPage ? postCount % q.limit : q.limit) > posts.length
      ) {
        const foundItems = await db.post.findMany({
          where: {
            seriesId: q.seriesId,
            published: q.published,
            tag: {
              some: {
                tagId: {
                  in: q.tags,
                },
              },
            },
          },
          orderBy,
          include: {
            tag: {
              select: {
                tagId: true,
              },
            },
          },
          take: q.limit,
          skip: q.page * q.limit + tried,
        });
        logger.info(
          `Found ${foundItems.length}, tried ${tried + foundItems.length}`
        );
        if (foundItems.length <= 0) {
          logger.warn(
            `Unexpected length ${foundItems.length}, expected at least 1. breaking loop`
          );
          break;
        }
        tried += foundItems.length;
        const filteredItems = foundItems.filter(({ tag }) => {
          const tags = tag.map(({ tagId }) => tagId);
          return q.tags.every((qtag: number) => tags.includes(qtag));
        });
        posts.push(...filteredItems);
        logger.info(
          `Filtered result ${filteredItems.length} posts, total post length ${posts.length}`
        );
      }
      logger.info(
        `Complete loop, final posts ${posts.length}, ideal maximum ${q.page >= maxPage ? postCount % q.limit : q.limit}`
      );
    } else {
      posts = await db.post.findMany({
        where: {
          seriesId: q.seriesId,
          published: q.published,
        },
        orderBy,
        take: q.limit,
        skip: q.page * q.limit,
      });
    }

    logger.info(`total ${posts.length} posts`);
    return { posts, maxPage };
  }
  return null;
}
// !SECTION Function
// SECTION Namespace
export namespace getPost {
  export type SortOrderDict = Record<string, "desc" | "asc">;
  export type ManySortUpdatedAt = "youngest_first" | "oldest_first";
  export type ManySortViews = "many_first" | "few_first";
  export interface UniqueIn {
    unique: {
      postId: number;
    };
  }
  export interface ManyIn {
    many: {
      page: number;
      limit: number;
      seriesId?: number;
      published?: boolean;
      tags?: number[];
      sortby?:
        | {
            updatedAt: ManySortUpdatedAt;
          }
        | {
            views: ManySortViews;
          };
    };
  }
  export type UniqueOut = Prisma.Post | null;
  export type ManyOut = { posts: Prisma.Post[]; maxPage: number };
}
// !SECTION Namespace
// !SECTION 포스트 탐색

// !SECTION Read
/*

*/
// SECTION Update

// SECTION 포스트 수정
// SECTION Function
/**
 * * 포스트 수정
 *
 * published가 true로 "변경"될 경우 publishedAt이 변경 기준 현재 시각으로 변경됨
 * published가 false로 "변경"될 경우 publishedAt은 NULL로 설정됨
 *
 * @in 변경될 포스트 메타데이터 및 변경할 포스트 ID
 */
export async function updatePost(
  logger: Logger,
  { postId, seriesId, published }: updatePost.In
) {
  logger.info(
    `Updating post ${postId} - ${published ? "" : "not"} published, ${seriesId ? "series " + seriesId : "not series"}`
  );
  const prevPost = await db.post.findUnique({
    where: { id: postId },
    select: { published: true },
  });

  let publishedAt: Date | undefined | null = undefined;
  if (prevPost?.published !== published) {
    logger.info(
      `Post ${postId} publish state changed, also updating publishedAt to ${published ? "now" : "null"}`
    );
    publishedAt = published ? new Date() : null;
  }

  await db.post.update({
    where: {
      id: postId,
    },
    data: {
      seriesId,
      published,
      publishedAt,
    },
  });
  logger.info(`Updated post ${postId}`);
}
// !SECTION Function
// SECTION Namespace
export namespace updatePost {
  export interface In {
    postId: number;
    seriesId?: number;
    published?: boolean;
  }
}
// !SECTION Namespace
// !SECTION 포스트 수정

// SECTION 포스트 조회수 증가
// SECTION Function
/**
 * * 포스트 조회수 증가
 *
 * @in 포스트 ID
 */
export async function incrementPostView(
  logger: Logger,
  { postId }: incrementPostView.In
) {
  const updatedPost = await db.post.update({
    where: {
      id: postId,
    },
    data: {
      views: {
        increment: 1,
      },
    },
    select: {
      views: true,
      seriesId: true,
    },
  });

  logger.info(`Updated post ${postId} view to ${updatedPost.views}`);

  if (updatedPost.seriesId) {
    const series = await db.series.update({
      where: {
        id: updatedPost.seriesId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
      select: {
        views: true,
      },
    });

    logger.info(
      `Found connected series ${updatedPost.seriesId}, incremented series view to ${series.views}`
    );
  }
}
// !SECTION Function
// SECTION Namespace
export namespace incrementPostView {
  export interface In {
    postId: number;
  }
}
// !SECTION Namespace
// !SECTION 포스트 조회수 증가

// !SECTION Update
/*

*/
// SECTION Delete

// SECTION 포스트 삭제
// SECTION Function
/**
 * * 포스트 삭제
 *
 * 포스트 삭제.
 * 포스트에 포함된 로캘 컨텐츠 전체 삭제.
 *
 * @in 삭제될 포스트 ID
 */
export async function deletePost(logger: Logger, { postId }: deletePost.In) {
  logger.info(`Deleting post ${postId}`);
  await db.post.delete({ where: { id: postId } });
  logger.info(`Deleted post ${postId}`);
}
// !SECTION Function
// SECTION Namespace
export namespace deletePost {
  export interface In {
    postId: number;
  }
}
// !SECTION Namespace
// !SECTION 포스트 삭제

// !SECTION Delete
// !SECTION 포스트
/*

------------------------------

*/
// SECTION 포스트 컨텐츠
/*

*/
// SECTION Create

// SECTION 포스트 컨텐츠 생성
// SECTION Function
/**
 * * 포스트 컨텐츠 생성
 *
 * @in 컨텐츠가 추가될 포스트의 ID 및 포스트의 컨텐츠, 로캘
 * @out 포스트 ID 및 로캘
 */
export async function createPostContent(
  logger: Logger,
  { postId, locale, published, content }: createPostContent.In
): Promise<createPostContent.Out> {
  logger.info(
    `Creating ${locale} content to post ${postId} (${published ? "" : "not "}published)`
  );

  const createdPostContent = await db.postLocaled.create({
    data: {
      postId: postId,
      locale: locale,
      published: published,
      ...content,
    },
    select: {
      postId: true,
      locale: true,
    },
  });

  logger.info(
    `Created post ${createdPostContent.postId} ${createdPostContent.locale} content`
  );

  return createdPostContent;
}
// !SECTION Function
// SECTION Namespace
export namespace createPostContent {
  export interface In {
    postId: number;
    locale: Prisma.Locale;
    content: {
      title: string;
      short: string;
      content: string;
    };
    published: boolean;
  }
  export interface Out {
    postId: number;
    locale: Prisma.Locale;
  }
}
// !SECTION Namespace
// !SECTION 포스트 컨텐츠 생성

// !SECTION Create
/*

*/
// SECTION Read

// SECTION 포스트 컨텐츠 탐색
// SECTION Function
/**
 * * 포스트 컨텐츠 탐색
 *
 * @in 검색할 포스트 정보
 * @out 검색된 포스트
 */
export async function readPostContent(
  logger: Logger,
  { postId, locale }: readPostContent.In
): Promise<readPostContent.Out> {
  const post = await db.postLocaled.findUnique({
    where: {
      locale_postId: {
        locale,
        postId,
      },
    },
  });

  if (post) {
    logger.info(`Found post ${post.postId} ${post.locale}`);
  } else {
    logger.info(`Not Found post ${postId} ${locale}`);
  }

  return post;
}
// !SECTION Function
// SECTION Namespace
export namespace readPostContent {
  export interface In {
    postId: number;
    locale: Prisma.Locale;
  }
  export type Out = Prisma.PostLocaled | null;
}
// !SECTION Namespace
// !SECTION 포스트 컨텐츠 탐색

// !SECTION Read
/*

*/
// SECTION Update

// SECTION 포스트 컨텐츠 수정
// SECTION Function
/**
 * * 포스트 컨텐츠 수정
 *
 * published가 true로 "변경"될 경우 publishedAt이 변경 기준 현재 시각으로 변경됨
 * published가 false로 "변경"될 경우 publishedAt은 NULL로 설정됨
 *
 * @in 컨텐츠가 변경될 포스트의 ID 및 포스트 컨텐츠의 로캘, 변경될 컨텐츠
 */
export async function updatePostContent(
  logger: Logger,
  { postId, locale, content, published }: updatePostContent.In
) {
  logger.info(
    `Updating post ${postId} content ${locale} - ${published ? "" : "not"} published`
  );
  const prevPostContent = await db.postLocaled.findFirst({
    where: { postId, locale },
    select: { published: true },
  });

  let publishedAt: Date | null | undefined = undefined;
  if (prevPostContent?.published !== published) {
    logger.info(
      `Post ${postId} content ${locale} publish state changed, also updating publishedAt to ${published ? "now" : "null"}`
    );
    publishedAt = published ? new Date() : null;
  }

  await db.postLocaled.update({
    where: {
      locale_postId: {
        locale,
        postId,
      },
    },
    data: {
      ...content,
      published,
      publishedAt,
    },
  });
  logger.info(`Updated post ${postId} content ${locale}`);
}
// !SECTION Function
// SECTION Namespace
export namespace updatePostContent {
  export interface In {
    postId: number;
    locale: Prisma.Locale;
    content?: {
      title?: string;
      short?: string;
      content?: string;
    };
    published?: boolean;
  }
}
// !SECTION Namespace
// !SECTION 포스트 컨텐츠 수정

// !SECTION Update
/*

*/
// SECTION Delete

// SECTION 포스트 컨텐츠 삭제
// SECTION Function
/**
 * * 포스트 컨텐츠 삭제
 *
 * PostLocaled를 삭제, Post 자체는 삭제하지 않음.
 *
 * @in 컨텐츠가 삭제될 포스트의 ID 및 포스트 컨텐츠 로캘
 * @opt all: true일 경우 모든 컨텐츠 삭제 (기본값 false)
 */
export async function deletePostContent(
  logger: Logger,
  { postId, locale }: deletePostContent.In
) {
  if (locale) {
    await db.postLocaled.delete({
      where: {
        locale_postId: {
          locale: locale,
          postId: postId,
        },
      },
    });
    logger.info(`Deleted content ${locale} in post ${postId}`);
  } else {
    await db.postLocaled.deleteMany({
      where: {
        postId: postId,
      },
    });
    logger.info(`Deleted all content in post ${postId}`);
  }
}
// !SECTION Function
// SECTION Namespace
export namespace deletePostContent {
  export interface In {
    postId: number;
    locale?: Prisma.Locale;
  }
}
// !SECTION Namespace
// !SECTION 포스트 컨텐츠 삭제

// !SECTION Delete
// !SECTION 포스트 컨텐츠

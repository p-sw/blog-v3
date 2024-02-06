/*

--------------------

*/
// SECTION 시리즈
/*

*/
// SECTION Create

import db, { Prisma } from "prisma";
import { Logger } from "winston";

// SECTION 시리즈 생성
// SECTION Function
/**
 * * 시리즈 생성
 *
 * @in 시리즈 초기화 데이터
 * @out 생성된 시리즈 ID
 */
export async function createSeries() {}
// !SECTION Function
// SECTION Namespace
export namespace createSeries {
  export type In = {
    locale: Prisma.Locale;
    title: string;
    description: string;
  }[];
  export interface Out {
    seriesId: number;
  }
}
// !SECTION Namespace
// !SECTION 시리즈 생성

// SECTION 시리즈 로캘 생성
// SECTION Function
/**
 * * 시리즈 로캘 생성
 *
 * @in 시리즈 ID 및 로캘 데이터
 */
export async function createSeriesLocale() {}
// !SECTION Function
// SECTION Namespace
export namespace createSeriesLocale {
  export interface In {
    locale: Prisma.Locale;
    title: string;
    description: string;
  }
}
// !SECTION Namespace
// !SECTION 시리즈 로캘 생성

// SECTION 포스트 추가
// SECTION Function
/**
 * * 포스트 추가
 *
 * @in 시리즈 ID 및 포스트 ID
 */
export async function addPostToSeries() {}
// !SECTION Function
// SECTION Namespace
export namespace addPostToSeries {
  export interface In {
    seriesId: number;
    postId: number;
  }
}
// !SECTION Namespace
// !SECTION 포스트 추가

// !SECTION Create
/*

*/
// SECTION Read

// SECTION 시리즈 탐색
// SECTION Function
/**
 * * 시리즈 탐색
 *
 * @in 탐색 조건
 * @out 시리즈 데이터
 */
export async function getSeries(
  logger: Logger,
  In: getSeries.ManyIn
): Promise<getSeries.ManyOut>;
export async function getSeries(
  logger: Logger,
  In: getSeries.UniqueIn
): Promise<getSeries.UniqueOut>;
export async function getSeries(
  logger: Logger,
  In: any
): Promise<getSeries.ManyOut | getSeries.UniqueOut> {
  if ("many" in In) {
    const q = In.many;
    logger.info(`Searching for many series (page ${q.page} limit ${q.limit})`);
    const series = await db.series.findMany({
      where: {},
    });
  } else if ("unique" in In) {
    const q = In.unique;
    logger.info(`Searching for unique series ${q.seriesId}`);
    const series = await db.series.findUnique({
      where: {
        id: q.seriesId,
      },
    });
    if (!series) {
      logger.info(`Series not found with id ${q.seriesId}`);
    } else {
      logger.info(`Series found with id ${q.seriesId}`);
    }

    return series;
  }

  return null;
}
// !SECTION Function
// SECTION Namespace
export namespace getSeries {
  export type SortByUpdatedAt = "oldest_first" | "youngest_first";
  export type SortByViews = "many_first" | "few_first";
  export type SortBy = "asc" | "desc";
  export type SortDictUpdatedAt = Record<SortByUpdatedAt, SortBy>;
  export type SortDictViews = Record<SortByViews, SortBy>;
  export interface ManyIn {
    many: {
      page: number;
      limit: number;
      published?: boolean;
      tags?: number[];
      sortby?:
        | {
            updatedAt: SortByUpdatedAt;
          }
        | {
            views: SortByViews;
          };
    };
  }
  export interface UniqueIn {
    unique: {
      seriesId: number;
    };
  }
  export type ManyOut = { series: Prisma.Series[]; maxPage: number };
  export type UniqueOut = Prisma.Series | null;
}
// !SECTION Namespace
// !SECTION 시리즈 탐색

// SECTION 시리즈 로캘 탐색
// SECTION Function
/**
 * *
 */
export async function getSeriesLocale() {}
// !SECTION Function
// SECTION Namespace
export namespace getSeriesLocale {}
// !SECTION Namespace
// !SECTION 시리즈 로캘 탐색

// !SECTION Read
/*

*/
// SECTION Update

// SECTION 시리즈 수정
// SECTION Function
/**
 * *
 */
export async function updateSeries() {}
// !SECTION Function
// SECTION Namespace
export namespace updateSeries {}
// !SECTION Namespace
// !SECTION 시리즈 수정

// SECTION 시리즈 로캘 수정
// SECTION Function
/**
 * *
 */
export async function updateSeriesLocale() {}
// !SECTION Function
// SECTION Namespace
export namespace updateSeriesLocale {}
// !SECTION Namespace
// !SECTION 시리즈 로캘 수정

// !SECTION Update
/*

*/
// SECTION Delete

// SECTION 시리즈 삭제
// SECTION Function
/**
 * *
 */
export async function deleteSeries() {}
// !SECTION Function
// SECTION Namespace
export namespace deleteSeries {}
// !SECTION Namespace
// !SECTION 시리즈 삭제

// SECTION 시리즈 로캘 삭제
// SECTION Function
/**
 * *
 */
export async function deleteSeriesLocale() {}
// !SECTION Function
// SECTION Namespace
export namespace deleteSeriesLocale {}
// !SECTION Namespace
// !SECTION 시리즈 로캘 삭제

// SECTION 포스트 제거
// SECTION Function
/**
 * *
 */
export async function removePostFromSeries() {}
// !SECTION Function
// SECTION Namespace
export namespace removePostFromSeries {}
// !SECTION Namespace
// !SECTION 포스트 제거

// !SECTION Delete
// !SECTION 시리즈

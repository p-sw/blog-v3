import db from "prisma";
import { Logger } from "winston";
/*

------------------------------

*/
// SECTION 어드민
/*

*/
// SECTION Read

// SECTION 관리자 정보 유효성 확인
// SECTION Function
/**
 * * 관리자 정보 유효성 확인
 *
 * @in 관리자 로그인 정보
 * @out 관리자 정보 확인 결과
 */
export async function validateAdminInfo(
  logger: Logger,
  { username, password }: validateAdminInfo.In
): Promise<validateAdminInfo.Out> {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminUser || !adminPass) {
    logger.error(`System admin information is not set.`);
    return {
      valid: false,
    };
  }

  if (username === adminUser && password === adminPass) {
    logger.info(`Username and password are both correct.`);
    return {
      valid: true,
    };
  }
  logger.warn(`Username or password is invalid.`);

  return {
    valid: false,
  };
}
// !SECTION Function
// SECTION Namespace
export namespace validateAdminInfo {
  export interface In {
    username: string;
    password: string;
  }

  export interface Out {
    valid: boolean;
  }
}
// !SECTION Namespace
// !SECTION 관리자 정보 유효성 확인

// !SECTION Read
// !SECTION 어드민
/*

------------------------------

*/
// SECTION 세션
/*

*/
// SECTION Create

// SECTION 관리자 세션 생성
// SECTION Function
/**
 * * 관리자 세션 생성
 *
 * @out 생성된 세션 ID
 */
export async function createSession(
  logger: Logger
): Promise<createSession.Out> {
  const newSession = await db.session.create({ data: {} });
  logger.info(`Created new session ${newSession.id}`);

  return {
    sessionId: newSession.id,
  };
}
// !SECTION Function
// SECTION Namespace
export namespace createSession {
  export interface Out {
    sessionId: string;
  }
}
// !SECTION Namespace
// !SECTION 관리자 세션 생성

// !SECTION Create
/*

*/
// SECTION Read

// SECTION 세션 유효성 확인
// SECTION Function
/**
 * * 세션 유효성 확인
 *
 * @in 세션 ID
 * @out 세션 유효성 확인 결과
 */
export async function checkSession(
  logger: Logger,
  { sessionId }: checkSession.In
): Promise<checkSession.Out> {
  if (!sessionId)
    return {
      valid: false,
    };

  const dbSession = await db.session.findUnique({
    where: { id: sessionId },
  });
  logger.info(`From database: ${dbSession?.id}`);
  if (dbSession) {
    logger.info(`Found session`);
  } else {
    logger.warn(`Not found session`);
  }

  return {
    valid: !!dbSession,
  };
}
// !SECTION Function
// SECTION Namespace
export namespace checkSession {
  export interface In {
    sessionId?: string;
  }

  export interface Out {
    valid: boolean;
  }
}
// !SECTION Namespace
// !SECTION 세션 유효성 확인

// !SECTION Read
/*

*/
// SECTION Delete

// SECTION 모든 관리자 세션 파기
// SECTION Function
/**
 * * 모든 관리자 세션 파기
 */
export async function destroyAllSession(logger: Logger) {
  await db.session.deleteMany({});
  logger.info(`Deleted all sessions`);
}
// !SECTION
// SECTION Namespace
export namespace destroyAllSession {}
// !SECTION Namespace
// !SECTION 모든 관리자 세션 파기

// !SECTION Delete
// !SECTION 세션

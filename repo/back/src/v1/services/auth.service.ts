import db from "prisma";
import { Logger } from "winston";

/**
 * 관리자 로그인 정보를 확인, 올바른지 판단
 *
 * @in 관리자 로그인 정보
 * @out 관리자 정보 확인 결과
 */
export async function validateAdminInfo(
  { username, password }: validateAdminInfo.In,
  logger: Logger
): Promise<validateAdminInfo.Out> {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPass = process.env.ADMIN_PASSWORD;
  if (!adminUser || !adminPass) {
    return {
      valid: false,
    };
  }

  if (username === adminUser && password === adminPass) {
    return {
      valid: true,
    };
  }

  return {
    valid: false,
  };
}
export namespace validateAdminInfo {
  export interface In {
    username: string;
    password: string;
  }

  export interface Out {
    valid: boolean;
  }
}

/**
 * 새로운 관리자 세션 생성
 *
 * @out 생성된 세션 ID
 */
export async function createSession(
  logger: Logger
): Promise<createSession.Out> {
  const newSession = await db.session.create({});

  return {
    sessionId: newSession.id,
  };
}
export namespace createSession {
  export interface Out {
    sessionId: string;
  }
}

/**
 * 세션 ID로 세션 존재 여부 확인
 *
 * @in 세션 ID
 * @out 세션 존재 여부 확인 결과
 */
export async function checkSession(
  { sessionId }: checkSession.In,
  logger: Logger
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
export namespace checkSession {
  export interface In {
    sessionId?: string;
  }

  export interface Out {
    valid: boolean;
  }
}

/**
 * 모든 관리자 세션 파기
 *
 */
export async function destroyAllSession(logger: Logger) {
  await db.session.deleteMany({});
}
export namespace destroyAllSession {}

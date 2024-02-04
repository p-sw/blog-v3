import { Elysia, t } from "elysia";
import createModuleLogger, { createRequestLogger } from "logger";
import * as authService from "v1/services/auth.service";

const logger = createModuleLogger(1, "Auth");

const authModule = new Elysia({ prefix: "auth" })
  .onStart(() => logger.info("AuthModule is ready."))
  .derive(() => createRequestLogger(logger))
  .get("/", async ({ cookie: { session }, logger }) => {
    logger.info(`Checking session validity of ${session.value}`);
    const valid = await authService.checkSession(
      { sessionId: session.value },
      logger
    );
    logger.info(`${valid.valid} - session valid`);
    return valid;
  })
  .get(
    "/login",
    async ({ body, cookie, logger }) => {
      const { valid } = await authService.validateAdminInfo(body, logger);

      if (!valid) return;

      const { sessionId } = await authService.createSession(logger);

      cookie.session.set({
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        value: sessionId,
      });
    },
    {
      body: t.Object({
        username: t.String({ pattern: "^[a-zA-Z0-9]+$" }),
        password: t.String({
          pattern:
            "^(?=.*[a-zA-Z])(?=.*d)(?=.*[!@#$%^&*+-_=?])[A-Za-zd!@#$%^&*+-_=?]$",
        }),
      }),
    }
  );
export default authModule;

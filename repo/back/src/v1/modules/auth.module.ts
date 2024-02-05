import { Elysia, t } from "elysia";
import createModuleLogger, { createRequestLogger } from "logger";
import { auth } from "v1/services";

const logger = createModuleLogger(1, "Auth");

const authModule = new Elysia({ prefix: "auth" })
  .onStart(() => logger.info("AuthModule is ready."))
  .derive(() => createRequestLogger(logger))
  .get("/", async ({ cookie: { session }, logger }) => {
    logger.info(`Checking session validity of ${session.value}`);
    const valid = await auth.checkSession(logger, {
      sessionId: session.value,
    });
    logger.info(`${valid.valid} - session valid`);
    return valid;
  })
  .get(
    "/login",
    async ({ body, cookie, logger }) => {
      const { valid } = await auth.validateAdminInfo(logger, body);

      if (!valid) return;

      const { sessionId } = await auth.createSession(logger);

      cookie.session.set({
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        value: sessionId,
      });
    },
    {
      body: t.Object({
        username: t.String({ pattern: "^[a-zA-Z0-9]+$", default: "" }),
        password: t.String({
          pattern:
            "^(?=.*[a-zA-Z])(?=.*d)(?=.*[!@#$%^&*+-_=?])[A-Za-zd!@#$%^&*+-_=?]$",
          default: "",
        }),
      }),
    }
  );
export default authModule;

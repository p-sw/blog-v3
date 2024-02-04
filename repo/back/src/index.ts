import { Elysia } from "elysia";
import { createGlobalLogger } from "logger";
import { config } from "dotenv";
import v1 from "v1";

config();
const requiredAppEnv = ["ADMIN_USERNAME", "ADMIN_PASSWORD", "DATABASE_URL"].map(
  (k) => [process.env[k] === undefined, k]
);

if (!requiredAppEnv.every((v) => !v[0])) {
  console.log(process.env);
  throw new Error(
    `Please fill required app environment variables: ${requiredAppEnv
      .filter((v) => v[0])
      .map((v) => v[1])
      .join(", ")}`
  );
}

const appLogger = createGlobalLogger("App");

const app = new Elysia()
  .onStart(() => appLogger.info("Elysia server is ready to start."))
  .use(v1)
  .listen(process.env.PORT ?? 8000);

appLogger.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);

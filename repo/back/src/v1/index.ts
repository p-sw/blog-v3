import { Elysia } from "elysia";
import errors from "error";
import hyperid from "hyperid";
import createModuleLogger from "logger";
import authModule from "v1/modules/auth.module";

const v1Logger = createModuleLogger(1);
const v1HyperId = hyperid();

const v1 = new Elysia({ prefix: "v1" })
  .onStart(() => v1Logger.info("v1 API Loaded."))
  .error(errors)
  .derive(() => {
    return {
      logger: v1Logger.child({ requestId: v1HyperId() }),
    };
  })
  .onRequest(({ request }) => {
    v1Logger.info(`Request Initialized (${request.url} ${request.method})`);
  })
  .onBeforeHandle(({ request, logger }) => {
    logger.info(`Request Ready: ${request.url} ${request.method}`);
  })
  .onAfterHandle(({ logger, request }) => {
    logger.info(`Request Done: ${request.url} ${request.method}`);
  })
  .onError(({ logger, code, error }) => {
    switch (code) {
      case "VALIDATION":
        logger.error(`Validation Error: ${error.message}`);
        return error.toResponse();
      case "NOT_FOUND":
      case "NotFound":
        logger.error(`NotFoundError: ${error.status} ${error.code}`);
        return error;
      case "PARSE":
        logger.error(`ParseError: Error while parsing body`);
        return error;
      case "BadRequest":
        logger.error(`BadRequestError: ${error.status} ${error.code}`);
        return error;
      case "Forbidden":
        logger.error(`ForbiddenError: ${error.status} ${error.code}`);
        return error;
      case "Unauthorized":
        logger.error(`UnauthorizedError: ${error.status} ${error.code}`);
        return error;
      case "INTERNAL_SERVER_ERROR":
      case "InternalServerError":
      case "INVALID_COOKIE_SIGNATURE":
      case "UNKNOWN":
      default:
        if (error.stack) {
          logger.error(error.stack);
        }
        logger.error(`Unknown Error: ${error.message}`);
        return "UnknownError";
    }
  })
  .use(authModule);

export default v1;

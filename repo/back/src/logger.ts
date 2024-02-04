import { Logger, createLogger, format, transports } from "winston";
const { combine, timestamp, label, printf, colorize, metadata } = format;
import hyperid from "hyperid";

const hyperId = hyperid();

const globalFormatter = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

export function createGlobalLogger(name: string) {
  return createLogger({
    format: combine(
      colorize(),
      label({ label: name }),
      timestamp(),
      globalFormatter
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: "logs/all.log" }),
    ],
    exceptionHandlers: [
      new transports.File({ filename: "logs/exception.log" }),
    ],
    exitOnError: false,
  });
}

const formatter = printf(({ level, message, metadata }) => {
  const { label, timestamp, requestId, version } = metadata;

  return `${timestamp}${requestId ? " | request=" + requestId : ""} | [v${version}]${label ? `[${label}]` : ""} ${level}: ${message}`;
});

export default function createModuleLogger(version: number, name?: string) {
  return createLogger({
    format: combine(
      colorize(),
      label({ label: name }),
      timestamp(),
      metadata(),
      formatter
    ),
    defaultMeta: {
      version,
    },
    transports: [
      new transports.Console(),
      new transports.File({ filename: "logs/all.log" }),
    ],
    exceptionHandlers: [
      new transports.File({ filename: "logs/exception.log" }),
    ],
    exitOnError: false,
  });
}

export function createRequestLogger(logger: Logger) {
  const requestLogger = logger.child({ requestId: hyperId() });

  return {
    logger: requestLogger,
  };
}

import { transports, createLogger, LoggerOptions, format } from "winston";

const { timestamp, combine, errors, json } = format;

export const commonFormat = combine(
  timestamp(),
  errors(),
  json(),
);

const transportOptions: LoggerOptions["transports"] = [
  new transports.Console(),
];

export const getLogger = (env: CloudflareEnv) => {
  return createLogger({
    level: env.NEXTJS_ENV === "production" ? "info" : "debug",
    transports: transportOptions,
    format: commonFormat,
  })
};

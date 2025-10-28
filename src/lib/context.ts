import { createDatabaseClient, type DatabaseClient } from "@/database/client";
import { getLogger, type Logger } from "./logger";

export type Context = {
  env: CloudflareEnv;
  logger: Logger;
  db: DatabaseClient;
  kv: KVNamespace;
};

export const createContext = (env: CloudflareEnv): Context => {
  return {
    env,
    logger: getLogger(env),
    db: createDatabaseClient(env),
    kv: env.KV,
  };
};

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
// biome-ignore lint/performance/noNamespaceImport: import all schemas
import * as schema from "./schemas";

const DEFAULT_DB_FILE_NAME = "sqlite.db";
const sqlite = new Database(DEFAULT_DB_FILE_NAME);

export const db = drizzle(sqlite, { schema });
export type Db = typeof db;

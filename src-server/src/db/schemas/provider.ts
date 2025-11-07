import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { z } from "zod";

const llmModelSchema = z.object({
  id: z.string(),
  contextWindow: z.int(),
  capabilities: z.object({
    toolUse: z.boolean().optional(),
    vision: z.boolean().optional(),
  }),
});

const llmProviderType = z.enum(["openai", "anthropic", "gemini"]);

export type LlmModel = z.infer<typeof llmModelSchema>;
export type LlmProviderType = z.infer<typeof llmProviderType>;

export const providers = sqliteTable("providers", {
  id: integer("id").primaryKey({ autoIncrement: true }).unique(),
  name: text("name").notNull(),
  type: text("type").$type<LlmProviderType>().notNull(),
  apiKey: text("api_key").notNull(),
  baseUrl: text("base_url"),
  models: text("models", { mode: "json" }).$type<LlmModel[]>().notNull(),
});

export type Provider = typeof providers.$inferSelect;

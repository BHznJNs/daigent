import { z } from "zod";

export const AppThemeSchema = z.enum(["system", "light", "dark"]);
export const LanguageSchema = z.enum(["en", "zh_CN"]);
export const AppConfigSchema = z.object({
  theme: AppThemeSchema,
  language: LanguageSchema,
});
export type AppTheme = z.infer<typeof AppThemeSchema>;
export type Language = z.infer<typeof LanguageSchema>;
export type AppConfig = z.infer<typeof AppConfigSchema>;

export type PromiseOr<T> = Promise<T> | T;

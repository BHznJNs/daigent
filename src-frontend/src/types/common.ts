export type AppTheme = "system" | "light" | "dark";
export type Language = "en" | "zh_CN";
export type AppConfig = {
  theme: AppTheme;
  language: Language;
};

export type PromiseOr<T> = Promise<T> | T;

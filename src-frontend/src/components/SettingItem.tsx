import { cn } from "@/lib/utils";

export type SettingItemProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  contentClassName?: string;
};

export function SettingItem({
  title,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName,
  contentClassName,
}: SettingItemProps) {
  return (
    <div
      className={cn("flex items-center justify-between py-2 pr-1.5", className)}
    >
      <div className="space-y-1 pr-4">
        <div className={cn("whitespace-nowrap leading-none", titleClassName)}>
          {title}
        </div>
        {description && (
          <div
            className={cn(
              "text-muted-foreground text-xs",
              descriptionClassName
            )}
          >
            {description}
          </div>
        )}
      </div>
      <div className={cn("flex items-center", contentClassName)}>
        {children}
      </div>
    </div>
  );
}

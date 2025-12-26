type CustomToolProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
};

export function CustomTool({ icon, title, children }: CustomToolProps) {
  return (
    <div className="mb-4 w-full rounded-md border">
      <div className="flex w-full items-center gap-2 p-3 font-medium text-sm">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-2 p-4 pt-1">{children}</div>
    </div>
  );
}

import { ExternalLink } from "lucide-react";

type LinkItemProps = {
  href: string;
  children?: React.ReactNode;
};

export function LinkItem({ href, children }: LinkItemProps) {
  return (
    <a
      className="inline-flex items-center text-primary hover:underline dark:text-blue-300"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children ?? href}
      <ExternalLink size={12} />
    </a>
  );
}

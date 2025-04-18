import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface HeadingProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  descriptionClassName?: string;
}

export function Heading({
  title,
  description,
  children,
  className,
  descriptionClassName,
}: HeadingProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h2 className={cn("text-2xl font-semibold tracking-tight", className)}>
          {title}
        </h2>
        {description && (
          <p className={cn("text-sm text-muted-foreground", descriptionClassName)}>
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
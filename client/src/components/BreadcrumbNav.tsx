import { ChevronRight, Home } from "lucide-react";
import { Link, useLocation } from "wouter";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb navigation component that shows the user's current location in the app
 * And provides links back to previous pages
 */
export function BreadcrumbNav({ items, className = "" }: BreadcrumbNavProps) {
  const [location] = useLocation();

  return (
    <nav className={`flex items-center text-sm ${className}`}>
      <Link href="/">
        <a className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
          <Home className="h-4 w-4 mr-1" />
          Home
        </a>
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />
          
          {item.href && item.href !== location ? (
            <Link href={item.href}>
              <a className="text-muted-foreground hover:text-foreground transition-colors">
                {item.label}
              </a>
            </Link>
          ) : (
            <span className="font-medium text-foreground">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
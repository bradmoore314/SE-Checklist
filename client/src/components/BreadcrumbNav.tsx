import { Fragment } from "react";
import { Link } from "wouter";
import { ChevronRight, HomeIcon } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumb navigation component for easy back-navigation
 * Displays a path hierarchy from home to current location
 */
export function BreadcrumbNav({ items, className = "" }: BreadcrumbNavProps) {
  return (
    <nav 
      className={`flex items-center text-sm text-muted-foreground ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        <li>
          <Link href="/">
            <a className="flex items-center hover:text-primary">
              <HomeIcon className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </a>
          </Link>
        </li>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <Fragment key={index}>
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4" />
              </li>
              
              <li>
                {isLast || !item.href ? (
                  <span className={isLast ? "font-medium text-foreground" : ""}>
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href}>
                    <a className="hover:text-primary">
                      {item.label}
                    </a>
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
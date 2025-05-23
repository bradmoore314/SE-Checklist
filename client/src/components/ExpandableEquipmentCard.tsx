import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Edit, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableEquipmentCardProps {
  title: string;
  subtitle?: string;
  number: number;
  onEdit: () => void;
  onDelete: () => void;
  headerContent?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function ExpandableEquipmentCard({
  title,
  subtitle,
  number,
  onEdit,
  onDelete,
  headerContent,
  className,
  children
}: ExpandableEquipmentCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className={cn("overflow-hidden transition-all", expanded ? "border-primary" : "", className)}>
      <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-medium mr-2">
              {number}
            </div>
            <div>
              <h3 className="text-lg font-medium">{title}</h3>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          </div>
          {headerContent && <div className="mt-2">{headerContent}</div>}
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        "px-4 transition-all duration-300 overflow-hidden",
        expanded ? "pb-4" : "h-0 pb-0 pt-0"
      )}>
        {children}
      </CardContent>
      
      <CardFooter className="px-4 py-2 flex justify-end border-t bg-muted/20">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
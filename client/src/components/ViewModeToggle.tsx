import { Button } from "@/components/ui/button";
import { LayoutList, Grid } from "lucide-react";

export type ViewMode = "cards" | "list";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onChange: (viewMode: ViewMode) => void;
}

export function ViewModeToggle({ viewMode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-muted-foreground">View:</span>
      <Button
        variant={viewMode === "cards" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("cards")}
        className="px-2 py-1 h-8"
      >
        <Grid className="h-4 w-4 mr-1" />
        Cards
      </Button>
      <Button
        variant={viewMode === "list" ? "default" : "outline"}
        size="sm"
        onClick={() => onChange("list")}
        className="px-2 py-1 h-8"
      >
        <LayoutList className="h-4 w-4 mr-1" />
        List
      </Button>
    </div>
  );
}
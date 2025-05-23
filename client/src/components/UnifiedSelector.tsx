import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { INCIDENT_TYPES } from "@/constants/incidentTypes";
import { ChevronDown, ChevronRight, Search, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Group incident types by category
const incidentTypesByCategory = INCIDENT_TYPES.reduce((acc, incident) => {
  if (!acc[incident.category]) {
    acc[incident.category] = [];
  }
  acc[incident.category].push(incident);
  return acc;
}, {} as Record<string, typeof INCIDENT_TYPES>);

const categories = Object.keys(incidentTypesByCategory);

interface UnifiedSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  variant?: 'basic' | 'enhanced' | 'compact';
  searchable?: boolean;
  showBadges?: boolean;
  collapsible?: boolean;
}

/**
 * Unified Selector Component - Consolidates IncidentTypeSelector and EnhancedIncidentTypeSelector
 * Supports multiple variants and display modes for maximum flexibility
 */
export function UnifiedSelector({ 
  value = [], 
  onChange, 
  className,
  variant = 'enhanced',
  searchable = true,
  showBadges = true,
  collapsible = true
}: UnifiedSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    categories.reduce((acc, cat) => {
      acc[cat] = true;
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Filter incident types based on search query
  const filteredIncidentTypes = searchQuery
    ? INCIDENT_TYPES.filter(incident =>
        incident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        incident.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : INCIDENT_TYPES;

  // Group filtered incident types by category
  const filteredByCategory = filteredIncidentTypes.reduce((acc, incident) => {
    if (!acc[incident.category]) {
      acc[incident.category] = [];
    }
    acc[incident.category].push(incident);
    return acc;
  }, {} as Record<string, typeof INCIDENT_TYPES>);

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleIncident = (incidentName: string) => {
    const newValue = value.includes(incidentName)
      ? value.filter(item => item !== incidentName)
      : [...value, incidentName];
    onChange(newValue);
  };

  const clearAll = () => {
    onChange([]);
  };

  const selectAll = () => {
    onChange(INCIDENT_TYPES.map(incident => incident.name));
  };

  const isSelected = (incidentName: string) => value.includes(incidentName);

  // Render for basic variant (checkbox style)
  const renderBasicView = () => (
    <div className={cn("space-y-4", className)}>
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search incident types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {showBadges && value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <Badge key={item} variant="secondary" className="flex items-center gap-1">
              {item}
              <button
                onClick={() => toggleIncident(item)}
                className="ml-1 hover:text-destructive"
              >
                <XCircle className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={selectAll}>
          Select All
        </Button>
        <Button variant="outline" size="sm" onClick={clearAll}>
          Clear All
        </Button>
      </div>

      {Object.entries(filteredByCategory).map(([category, incidents]) => (
        <div key={category} className="space-y-2">
          {collapsible ? (
            <Collapsible
              open={openCategories[category]}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto font-medium">
                  {openCategories[category] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  {category} ({incidents.length})
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2 ml-6">
                {incidents.map((incident) => (
                  <div key={incident.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={incident.name}
                      checked={isSelected(incident.name)}
                      onCheckedChange={() => toggleIncident(incident.name)}
                    />
                    <Label
                      htmlFor={incident.name}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {incident.name}
                    </Label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <div>
              <h4 className="font-medium mb-2">{category}</h4>
              <div className="space-y-2 ml-4">
                {incidents.map((incident) => (
                  <div key={incident.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={incident.name}
                      checked={isSelected(incident.name)}
                      onCheckedChange={() => toggleIncident(incident.name)}
                    />
                    <Label
                      htmlFor={incident.name}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {incident.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Render for enhanced variant (chip/tag style)
  const renderEnhancedView = () => (
    <div className={cn("space-y-4", className)}>
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search incident types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {showBadges && value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
          <span className="text-sm font-medium text-muted-foreground">Selected:</span>
          {value.map((item) => (
            <Badge key={item} variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              {item}
              <button
                onClick={() => toggleIncident(item)}
                className="ml-1 hover:text-destructive"
              >
                <XCircle className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <Button variant="outline" size="sm" onClick={selectAll}>
          Select All ({INCIDENT_TYPES.length})
        </Button>
        <Button variant="outline" size="sm" onClick={clearAll}>
          Clear All
        </Button>
      </div>

      {Object.entries(filteredByCategory).map(([category, incidents]) => (
        <div key={category} className="space-y-3">
          {collapsible ? (
            <Collapsible
              open={openCategories[category]}
              onOpenChange={() => toggleCategory(category)}
            >
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 p-2 h-auto font-medium text-left hover:bg-muted/50"
                >
                  {openCategories[category] ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span className="text-base">{category}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {incidents.filter(inc => isSelected(inc.name)).length}/{incidents.length}
                  </Badge>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2 ml-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {incidents.map((incident) => (
                    <Button
                      key={incident.name}
                      variant={isSelected(incident.name) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleIncident(incident.name)}
                      className={cn(
                        "justify-start text-left h-auto p-3 flex flex-col items-start",
                        isSelected(incident.name) && "bg-primary text-primary-foreground"
                      )}
                    >
                      <span className="font-medium">{incident.name}</span>
                      <span className="text-xs opacity-80 mt-1">
                        {incident.description}
                      </span>
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-medium">{category}</h4>
                <Badge variant="secondary">
                  {incidents.filter(inc => isSelected(inc.name)).length}/{incidents.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {incidents.map((incident) => (
                  <Button
                    key={incident.name}
                    variant={isSelected(incident.name) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleIncident(incident.name)}
                    className={cn(
                      "justify-start text-left h-auto p-3 flex flex-col items-start",
                      isSelected(incident.name) && "bg-primary text-primary-foreground"
                    )}
                  >
                    <span className="font-medium">{incident.name}</span>
                    <span className="text-xs opacity-80 mt-1">
                      {incident.description}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Render compact variant
  const renderCompactView = () => (
    <div className={cn("space-y-2", className)}>
      {searchable && (
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8"
        />
      )}
      
      <div className="flex flex-wrap gap-1">
        {filteredIncidentTypes.map((incident) => (
          <Button
            key={incident.name}
            variant={isSelected(incident.name) ? "default" : "outline"}
            size="sm"
            onClick={() => toggleIncident(incident.name)}
            className="h-7 text-xs"
          >
            {incident.name}
          </Button>
        ))}
      </div>
    </div>
  );

  // Choose rendering method based on variant
  switch (variant) {
    case 'basic':
      return renderBasicView();
    case 'compact':
      return renderCompactView();
    case 'enhanced':
    default:
      return renderEnhancedView();
  }
}
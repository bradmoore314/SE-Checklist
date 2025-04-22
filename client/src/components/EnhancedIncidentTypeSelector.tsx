import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
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

// Get list of categories
const categories = Object.keys(incidentTypesByCategory);

interface EnhancedIncidentTypeSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

/**
 * Enhanced version of IncidentTypeSelector using Chips/Tags with clear highlighted selection
 */
export function EnhancedIncidentTypeSelector({
  value = [],
  onChange,
  className = ""
}: EnhancedIncidentTypeSelectorProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    categories.reduce((acc, cat) => {
      acc[cat] = true; // All categories open by default
      return acc;
    }, {} as Record<string, boolean>)
  );
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleToggleCategory = (category: string) => {
    setOpenCategories({
      ...openCategories,
      [category]: !openCategories[category]
    });
  };
  
  const handleToggleIncidentType = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter(v => v !== id));
    } else {
      onChange([...value, id]);
    }
  };
  
  const handleSelectAll = (category: string) => {
    const categoryIncidentIds = incidentTypesByCategory[category].map(i => i.id);
    // Add all that aren't already included
    const newValue = Array.from(new Set([...value, ...categoryIncidentIds]));
    onChange(newValue);
  };
  
  const handleDeselectAll = (category: string) => {
    const categoryIncidentIds = incidentTypesByCategory[category].map(i => i.id);
    const newValue = value.filter(v => !categoryIncidentIds.includes(v));
    onChange(newValue);
  };
  
  // Filter incident types based on search term
  const filteredIncidentTypes = searchTerm
    ? INCIDENT_TYPES.filter(incident => 
        incident.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Incident Types</h3>
        <p className="text-sm text-muted-foreground">
          Select the incident types to monitor for in this location
        </p>
      </div>
      
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search incident types..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>
      
      {/* Search results */}
      {searchTerm && filteredIncidentTypes.length > 0 && (
        <div className="border rounded-md p-3">
          <h4 className="text-sm font-medium mb-2">Search Results</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredIncidentTypes.map(incident => (
              <IncidentTypeChip
                key={incident.id}
                incident={incident}
                selected={value.includes(incident.id)}
                onToggle={() => handleToggleIncidentType(incident.id)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Categories */}
      <div className="space-y-4">
        {categories.map(category => (
          <Collapsible 
            key={category} 
            open={openCategories[category]} 
            onOpenChange={() => handleToggleCategory(category)}
            className="border rounded-md overflow-hidden"
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer bg-muted/40 p-3">
                <div className="flex items-center">
                  {openCategories[category] ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                  <span className="font-medium">{category}</span>
                  <SelectedCountBadge 
                    category={category} 
                    selected={value} 
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAll(category);
                    }}
                    className="text-xs h-7"
                  >
                    Select All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeselectAll(category);
                    }}
                    className="text-xs h-7"
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {incidentTypesByCategory[category].map(incident => (
                  <IncidentTypeChip
                    key={incident.id}
                    incident={incident}
                    selected={value.includes(incident.id)}
                    onToggle={() => handleToggleIncidentType(incident.id)}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
      
      {/* Selected incident types */}
      {value.length > 0 && (
        <div className="border rounded-md p-3">
          <h4 className="text-sm font-medium mb-2">Selected Incident Types</h4>
          <div className="flex flex-wrap gap-2">
            {value.map(selectedId => {
              const incident = INCIDENT_TYPES.find(i => i.id === selectedId);
              if (!incident) return null;
              
              return (
                <Button
                  key={selectedId}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleToggleIncidentType(selectedId)}
                  className="h-7 px-2 py-1 rounded-full"
                >
                  {incident.label}
                  <XCircle className="h-3 w-3 ml-1 text-muted-foreground" />
                </Button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for the incident type chips/tags
function IncidentTypeChip({ incident, selected, onToggle }: {
  incident: { id: string; label: string; category: string };
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex items-center justify-between w-full px-3 py-2 rounded-md text-sm text-left transition-colors",
        selected 
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-muted hover:bg-muted/80"
      )}
    >
      <span>{incident.label}</span>
      {selected && <CheckCircle className="h-4 w-4 ml-2 shrink-0" />}
    </button>
  );
}

// Badge component to show selected count
function SelectedCountBadge({ 
  category, 
  selected 
}: { 
  category: string; 
  selected: string[];
}) {
  const total = incidentTypesByCategory[category].length;
  const selectedCount = incidentTypesByCategory[category].filter(i => selected.includes(i.id)).length;
  
  if (selectedCount === 0) return null;
  
  return (
    <div className="ml-2 px-1.5 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
      {selectedCount}/{total}
    </div>
  );
}
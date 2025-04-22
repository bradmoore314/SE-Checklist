import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { INCIDENT_TYPES } from "@/constants/incidentTypes";
import { ChevronDown, ChevronRight } from "lucide-react";

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

interface IncidentTypeSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export function IncidentTypeSelector({ value = [], onChange }: IncidentTypeSelectorProps) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    categories.reduce((acc, cat) => {
      acc[cat] = true; // All categories open by default
      return acc;
    }, {} as Record<string, boolean>)
  );

  const handleToggleCategory = (category: string) => {
    setOpenCategories({
      ...openCategories,
      [category]: !openCategories[category]
    });
  };

  const handleChange = (id: string, checked: boolean) => {
    if (checked) {
      onChange([...value, id]);
    } else {
      onChange(value.filter(v => v !== id));
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

  // Badge component to show selected count
  const SelectedCountBadge = ({ category }: { category: string }) => {
    const total = incidentTypesByCategory[category].length;
    const selected = incidentTypesByCategory[category].filter(i => value.includes(i.id)).length;
    
    if (selected === 0) return null;
    
    return (
      <Badge variant="secondary" className="ml-2">
        {selected}/{total}
      </Badge>
    );
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Incident Types</h3>
      
      <div className="space-y-4">
        {categories.map(category => (
          <Collapsible 
            key={category} 
            open={openCategories[category]} 
            onOpenChange={() => handleToggleCategory(category)}
            className="border rounded-md p-2"
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer py-2 px-1">
                <div className="flex items-center">
                  {openCategories[category] ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                  <span className="font-medium">{category}</span>
                  <SelectedCountBadge category={category} />
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectAll(category);
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeselectAll(category);
                    }}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                {incidentTypesByCategory[category].map(incident => (
                  <div key={incident.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`incident-${incident.id}`}
                      checked={value.includes(incident.id)}
                      onCheckedChange={(checked) => handleChange(incident.id, !!checked)}
                    />
                    <Label htmlFor={`incident-${incident.id}`} className="text-sm">
                      {incident.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
      
      {value.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Selected Incident Types</h4>
          <div className="flex flex-wrap gap-2">
            {value.map(selectedId => {
              const incident = INCIDENT_TYPES.find(i => i.id === selectedId);
              if (!incident) return null;
              
              return (
                <Badge 
                  key={selectedId}
                  variant="secondary"
                  className="py-1 px-2"
                >
                  {incident.label}
                  <button 
                    className="ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => handleChange(selectedId, false)}
                  >
                    ×
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
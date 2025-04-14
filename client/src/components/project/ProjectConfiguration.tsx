import { Project } from "@shared/schema";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface SiteWalkConfigurationProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
}

export default function ProjectConfiguration({ 
  project, 
  onProjectUpdate 
}: SiteWalkConfigurationProps) {
  const { toast } = useToast();
  
  // Config options from project
  const [configOptions, setConfigOptions] = useState({
    replace_readers: project.replace_readers || false,
    need_credentials: project.need_credentials || false,
    takeover: project.takeover || false,
    pull_wire: project.pull_wire || false,
    visitor: project.visitor || false,
    install_locks: project.install_locks || false,
    ble: project.ble || false,
    ppi_quote_needed: project.ppi_quote_needed || false,
    guard_controls: project.guard_controls || false,
    floorplan: project.floorplan || false,
    test_card: project.test_card || false,
    conduit_drawings: project.conduit_drawings || false,
    reports_available: project.reports_available || false,
    photo_id: project.photo_id || false,
    on_site_security: project.on_site_security || false,
    photo_badging: project.photo_badging || false,
    kastle_connect: project.kastle_connect || false,
    wireless_locks: project.wireless_locks || false,
    rush: project.rush || false
  });

  // Update config options when project changes
  useEffect(() => {
    setConfigOptions({
      replace_readers: project.replace_readers || false,
      need_credentials: project.need_credentials || false,
      takeover: project.takeover || false,
      pull_wire: project.pull_wire || false,
      visitor: project.visitor || false,
      install_locks: project.install_locks || false,
      ble: project.ble || false,
      ppi_quote_needed: project.ppi_quote_needed || false,
      guard_controls: project.guard_controls || false,
      floorplan: project.floorplan || false,
      test_card: project.test_card || false,
      conduit_drawings: project.conduit_drawings || false,
      reports_available: project.reports_available || false,
      photo_id: project.photo_id || false,
      on_site_security: project.on_site_security || false,
      photo_badging: project.photo_badging || false,
      kastle_connect: project.kastle_connect || false,
      wireless_locks: project.wireless_locks || false,
      rush: project.rush || false
    });
  }, [project]);

  // Handle config option change
  const handleConfigChange = async (option: keyof typeof configOptions, value: boolean) => {
    try {
      // Update local state
      setConfigOptions(prev => ({ ...prev, [option]: value }));
      
      // Update project in API
      const response = await apiRequest(
        "PUT", 
        `/api/projects/${project.id}`, 
        { [option]: value }
      );
      
      if (!response.ok) {
        throw new Error("Failed to update site walk configuration");
      }
      
      const updatedProject = await response.json();
      
      // Notify parent component of update
      if (onProjectUpdate) {
        onProjectUpdate(updatedProject);
      }
      
      toast({
        title: "Configuration Updated",
        description: `${formatOptionName(option)} has been ${value ? "enabled" : "disabled"}.`,
      });
    } catch (error) {
      // Revert local state if API update fails
      setConfigOptions(prev => ({ ...prev, [option]: !value }));
      
      toast({
        title: "Update Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Format option name for display
  const formatOptionName = (option: string): string => {
    return option
      .replace(/_/g, " ")
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .replace("Ble", "BLE")
      .replace("Ppi", "PPI");
  };

  return (
    <Card className="mb-6 border rounded-lg shadow-sm">
      <CardHeader className="px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-800">Site Walk Configuration</h3>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Object.entries(configOptions).map(([option, value]) => (
            <div className="flex items-center" key={option}>
              <Switch
                id={option}
                checked={value}
                onCheckedChange={(checked) => 
                  handleConfigChange(option as keyof typeof configOptions, checked)
                }
                style={value ? { backgroundColor: 'var(--red-accent)' } : {}}
              />
              <Label htmlFor={option} className="ml-2 text-sm text-gray-700">
                {formatOptionName(option)}?
              </Label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

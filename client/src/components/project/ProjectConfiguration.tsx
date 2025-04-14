import { Project } from "@shared/schema";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface SiteWalkConfigurationProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
}

export default function ProjectConfiguration({ 
  project, 
  onProjectUpdate 
}: SiteWalkConfigurationProps) {
  const { toast } = useToast();
  
  // Building count from project
  const [buildingCount, setBuildingCount] = useState(project.building_count || 1);
  
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

  // Update building count and config options when project changes
  useEffect(() => {
    setBuildingCount(project.building_count || 1);
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

  // Handle building count change
  const handleBuildingCountChange = async (newCount: number) => {
    try {
      // Update local state
      setBuildingCount(newCount);
      
      // Update project in API
      const response = await apiRequest(
        "PUT", 
        `/api/projects/${project.id}`, 
        { building_count: newCount }
      );
      
      if (!response.ok) {
        throw new Error("Failed to update building count");
      }
      
      const updatedProject = await response.json();
      
      // Notify parent component of update
      if (onProjectUpdate) {
        onProjectUpdate(updatedProject);
      }
      
      toast({
        title: "Building Count Updated",
        description: `Building count has been updated to ${newCount}.`,
      });
    } catch (error) {
      // Revert local state if API update fails
      setBuildingCount(project.building_count || 1);
      
      toast({
        title: "Update Failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

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

  // Define categories for configuration options
  const categories = {
    installation: [
      'replace_readers',
      'install_locks',
      'pull_wire',
      'wireless_locks',
      'conduit_drawings'
    ],
    access_control: [
      'need_credentials',
      'photo_id',
      'photo_badging',
      'ble',
      'test_card',
      'visitor',
      'guard_controls'
    ],
    site_conditions: [
      'floorplan',
      'reports_available',
      'kastle_connect',
      'on_site_security',
      'takeover',
      'rush',
      'ppi_quote_needed'
    ]
  };

  return (
    <Card className="mb-6 border rounded-lg shadow-sm">
      <CardHeader className="px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-800">Scope Info</h3>
      </CardHeader>
      <CardContent className="p-6">
        {/* Building Count */}
        <div className="mb-6">
          <Label htmlFor="building_count" className="text-sm font-medium text-gray-700 mb-2 block">
            Building Count
          </Label>
          <select
            id="building_count"
            className="w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={buildingCount || 1}
            onChange={(e) => handleBuildingCountChange(parseInt(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        {/* Installation/Hardware Scope */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-red-700 mb-3 flex items-center">
            <span className="material-icons mr-2">build</span>
            🔧 Installation/Hardware Scope
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.installation.map((option) => (
              <div className="flex items-center" key={option}>
                <Switch
                  id={option}
                  checked={configOptions[option as keyof typeof configOptions]}
                  onCheckedChange={(checked) => 
                    handleConfigChange(option as keyof typeof configOptions, checked)
                  }
                  style={configOptions[option as keyof typeof configOptions] ? { backgroundColor: 'var(--red-accent)' } : {}}
                />
                <Label htmlFor={option} className="ml-2 text-sm text-gray-700">
                  {formatOptionName(option)}?
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Access Control/Identity Management */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-red-700 mb-3 flex items-center">
            <span className="material-icons mr-2">fingerprint</span>
            🔐 Access Control/Identity Management
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.access_control.map((option) => (
              <div className="flex items-center" key={option}>
                <Switch
                  id={option}
                  checked={configOptions[option as keyof typeof configOptions]}
                  onCheckedChange={(checked) => 
                    handleConfigChange(option as keyof typeof configOptions, checked)
                  }
                  style={configOptions[option as keyof typeof configOptions] ? { backgroundColor: 'var(--red-accent)' } : {}}
                />
                <Label htmlFor={option} className="ml-2 text-sm text-gray-700">
                  {formatOptionName(option)}?
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Site Conditions / Project Planning */}
        <div>
          <h4 className="text-md font-medium text-red-700 mb-3 flex items-center">
            <span className="material-icons mr-2">business</span>
            🏗️ Site Conditions / Project Planning
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.site_conditions.map((option) => (
              <div className="flex items-center" key={option}>
                <Switch
                  id={option}
                  checked={configOptions[option as keyof typeof configOptions]}
                  onCheckedChange={(checked) => 
                    handleConfigChange(option as keyof typeof configOptions, checked)
                  }
                  style={configOptions[option as keyof typeof configOptions] ? { backgroundColor: 'var(--red-accent)' } : {}}
                />
                <Label htmlFor={option} className="ml-2 text-sm text-gray-700">
                  {formatOptionName(option)}?
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

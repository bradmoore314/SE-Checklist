import { Project } from "@shared/schema";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

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
  
  // Config options from project - all unchecked by default
  const [configOptions, setConfigOptions] = useState({
    replace_readers: project.replace_readers === true ? true : false,
    need_credentials: project.need_credentials === true ? true : false,
    takeover: project.takeover === true ? true : false,
    pull_wire: project.pull_wire === true ? true : false,
    visitor: project.visitor === true ? true : false,
    install_locks: project.install_locks === true ? true : false,
    ble: project.ble === true ? true : false,
    ppi_quote_needed: project.ppi_quote_needed === true ? true : false,
    guard_controls: project.guard_controls === true ? true : false,
    floorplan: project.floorplan === true ? true : false,
    test_card: project.test_card === true ? true : false,
    conduit_drawings: project.conduit_drawings === true ? true : false,
    reports_available: project.reports_available === true ? true : false,
    photo_id: project.photo_id === true ? true : false,
    on_site_security: project.on_site_security === true ? true : false,
    photo_badging: project.photo_badging === true ? true : false,
    kastle_connect: project.kastle_connect === true ? true : false,
    wireless_locks: project.wireless_locks === true ? true : false,
    rush: project.rush === true ? true : false
  });

  // Update building count and config options when project changes
  useEffect(() => {
    setBuildingCount(project.building_count || 1);
    setConfigOptions({
      replace_readers: project.replace_readers === true ? true : false,
      need_credentials: project.need_credentials === true ? true : false,
      takeover: project.takeover === true ? true : false,
      pull_wire: project.pull_wire === true ? true : false,
      visitor: project.visitor === true ? true : false,
      install_locks: project.install_locks === true ? true : false,
      ble: project.ble === true ? true : false,
      ppi_quote_needed: project.ppi_quote_needed === true ? true : false,
      guard_controls: project.guard_controls === true ? true : false,
      floorplan: project.floorplan === true ? true : false,
      test_card: project.test_card === true ? true : false,
      conduit_drawings: project.conduit_drawings === true ? true : false,
      reports_available: project.reports_available === true ? true : false,
      photo_id: project.photo_id === true ? true : false,
      on_site_security: project.on_site_security === true ? true : false,
      photo_badging: project.photo_badging === true ? true : false,
      kastle_connect: project.kastle_connect === true ? true : false,
      wireless_locks: project.wireless_locks === true ? true : false,
      rush: project.rush === true ? true : false
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
  
  // Tooltip descriptions for each config option
  const tooltips: Record<string, string> = {
    // Installation/Hardware Scope
    replace_readers: "Indicates existing readers are being swapped out. Costs depend on compatibility with existing infrastructure (e.g., backbox size, wiring) and may require trim plates or rework if the form factor differs.",
    install_locks: "Adds labor and material costs for electric locks (e.g., strikes, maglocks). Also increases scope due to the need for door prep, power supplies, and potential coordination with locksmiths or GCs.",
    pull_wire: "Signals that we're responsible for running cable — adds significant labor, materials, and possibly lift equipment. Impacts timeline, especially in finished spaces or plenum ceilings.",
    wireless_locks: "Suggests a different install approach — fewer wires but higher hardware cost. May require additional gateways and power considerations. Can simplify install but complicate system design.",
    conduit_drawings: "Required when electrical trades or permitting demand documentation of raceways. Adds engineering or design time, typically involves CAD work, and may require coordination with electrical subcontractors.",
    
    // Access Control/Identity Management
    need_credentials: "Triggers the need to quote cards/fobs/mobile credentials. Impacts both hardware costs and ongoing credential management requirements.",
    photo_id: "Suggests integration with photo capture or badge printing systems. Adds hardware (camera, badge printer) and software licensing costs, plus labor to configure.",
    photo_badging: "Indicates that the system will need to produce printed credentials. Adds complexity to the quote with badge printers, consumables, and potential software requirements.",
    ble: "Mobile credentialing support impacts hardware (readers must support BLE), licensing, and ongoing app fees. Also may require customer training or setup.",
    test_card: "Required for reader alignment or troubleshooting. May indicate that a validation step is needed post-installation, which could mean a return trip or additional onsite time.",
    visitor: "If visitor management is required, it may trigger additional hardware (e.g., visitor kiosks, printers), software modules, or integrations.",
    guard_controls: "May involve panic buttons, override switches, or custom interfaces for security personnel. Increases design and wiring complexity, and may require consultation with on-site staff.",
    
    // Site Conditions / Project Planning
    floorplan: "Absence of a floorplan complicates scoping — SEs may need to create one, or risk underquoting due to unknowns. Presence of a plan helps with accuracy and efficiency.",
    reports_available: "If system reports are available (from an existing access control system), we can use them to validate quantities and locations, improving quoting accuracy and reducing surprises.",
    kastle_connect: "Refers to our managed connectivity solution. Impacts pricing model, removes dependency on client internet, and adds recurring and equipment costs.",
    on_site_security: "If a guard is present during install, this may affect access to spaces or allow for faster coordination. Alternatively, if required, it may add cost or scheduling restrictions.",
    takeover: "Indicates we're inheriting existing hardware. This increases uncertainty and can lead to rework or incompatibility issues, so a contingency buffer or detailed assessment is often needed.",
    rush: "Affects labor pricing and scheduling. May trigger overtime rates, prioritization fees, or require pulling resources from other jobs.",
    ppi_quote_needed: "Means we need to get pricing from a third party (usually a certified installer or product partner). Adds time to the quoting process and may introduce variables we can't fully control."
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.installation.map((option) => (
              <div className="flex items-center" key={option}>
                <Toggle
                  pressed={configOptions[option as keyof typeof configOptions]}
                  onPressedChange={(pressed) => 
                    handleConfigChange(option as keyof typeof configOptions, pressed)
                  }
                  variant="red"
                  className="w-full justify-start text-sm"
                >
                  <span className="mr-2">{formatOptionName(option)}?</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3 text-sm">
                        {tooltips[option]}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Toggle>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.access_control.map((option) => (
              <div className="flex items-center" key={option}>
                <Toggle
                  pressed={configOptions[option as keyof typeof configOptions]}
                  onPressedChange={(pressed) => 
                    handleConfigChange(option as keyof typeof configOptions, pressed)
                  }
                  variant="blue"
                  className="w-full justify-start text-sm"
                >
                  <span className="mr-2">{formatOptionName(option)}?</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3 text-sm">
                        {tooltips[option]}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Toggle>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.site_conditions.map((option) => (
              <div className="flex items-center" key={option}>
                <Toggle
                  pressed={configOptions[option as keyof typeof configOptions]}
                  onPressedChange={(pressed) => 
                    handleConfigChange(option as keyof typeof configOptions, pressed)
                  }
                  variant="amber"
                  className="w-full justify-start text-sm"
                >
                  <span className="mr-2">{formatOptionName(option)}?</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs p-3 text-sm">
                        {tooltips[option]}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Toggle>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

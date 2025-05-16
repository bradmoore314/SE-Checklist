import { useState, useEffect } from "react";
import { Project } from "@shared/schema";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ScopeTabProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
}

export default function ScopeTab({ project, onProjectUpdate }: ScopeTabProps) {
  const { toast } = useToast();
  const [configOptions, setConfigOptions] = useState({
    takeover: project.takeover || false,
    pull_wire: project.pull_wire || false,
    replace_readers: project.replace_readers || false,
    need_credentials: project.need_credentials || false,
    install_locks: project.install_locks || false,
    visitor: project.visitor || false,
    ble: project.ble || false,
    floorplan: project.floorplan || false,
  });
  const [buildingCount, setBuildingCount] = useState<number>(project.building_count || 1);

  useEffect(() => {
    setConfigOptions({
      takeover: project.takeover || false,
      pull_wire: project.pull_wire || false,
      replace_readers: project.replace_readers || false,
      need_credentials: project.need_credentials || false,
      install_locks: project.install_locks || false,
      visitor: project.visitor || false,
      ble: project.ble || false,
      floorplan: project.floorplan || false,
    });
    setBuildingCount(project.building_count || 1);
  }, [project]);

  // Categories for organization
  const categories = {
    site_conditions: ["takeover", "pull_wire"],
    installation: ["replace_readers", "need_credentials", "install_locks"],
    access_control: ["visitor", "ble", "floorplan"],
  };

  // Tooltips for each option
  const tooltips: Record<string, string> = {
    takeover: "Indicates existing equipment is being reused in some capacity",
    pull_wire: "New cable runs will be required for this installation",
    replace_readers: "Indicates existing readers are being swapped out",
    need_credentials: "Credentials need to be issued to occupants",
    install_locks: "New locks need to be installed as part of this project",
    visitor: "Visitor management is needed for this site",
    ble: "Mobile credentials (Bluetooth Low Energy) are required",
    floorplan: "Floorplan integration is needed for this project",
  };

  // Mutation to update the project
  const updateProjectMutation = useMutation<Project, Error, Partial<Project>>({
    mutationFn: async (updatedData: Partial<Project>) => {
      const response = await apiRequest("PUT", `/api/projects/${project.id}`, updatedData);
      return await response.json();
    },
    onSuccess: (updatedProject: Project) => {
      if (onProjectUpdate) {
        onProjectUpdate(updatedProject);
      }
      
      // Show success toast for significant changes
      if (updatedProject.building_count !== undefined) {
        toast({
          title: "Building Count Updated",
          description: `Building count set to ${updatedProject.building_count}`,
        });
      }
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Format option names for display
  const formatOptionName = (option: string): string => {
    return option
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get emoji for each option
  const getOptionEmoji = (option: string): string => {
    const emojiMap: Record<string, string> = {
      takeover: "🔄",
      pull_wire: "🧵",
      replace_readers: "🔁",
      need_credentials: "🔑",
      install_locks: "🔒",
      visitor: "👥",
      ble: "📱",
      floorplan: "🗺️",
    };
    return emojiMap[option] || "✅";
  };

  // Handle toggle change for configuration options
  const handleConfigChange = (option: keyof typeof configOptions, value: boolean) => {
    setConfigOptions(prev => ({ ...prev, [option]: value }));
    
    // Update in backend
    const updateData: Partial<Project> = {
      [option]: value
    };
    updateProjectMutation.mutate(updateData);
  };

  // Handle building count change
  const handleBuildingCountChange = (count: number) => {
    setBuildingCount(count);
    updateProjectMutation.mutate({ building_count: count });
  };

  return (
    <Card className="mb-6 border rounded-lg shadow-sm">
      <CardHeader className="px-6 py-4 border-b">
        <h3 className="text-lg font-medium text-gray-800">Scope Information</h3>
      </CardHeader>
      <CardContent className="p-6">
        {/* Site Conditions / Project Planning - Moved to top */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-red-700 mb-3 flex items-center">
            <span className="mr-2">🏗️</span>
            Site Conditions / Project Planning
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.site_conditions.map((option) => {
              const emoji = getOptionEmoji(option);
              return (
                <div className="flex items-center" key={option}>
                  <Toggle
                    pressed={configOptions[option as keyof typeof configOptions]}
                    onPressedChange={(pressed) => 
                      handleConfigChange(option as keyof typeof configOptions, pressed)
                    }
                    variant="amber"
                    className="w-full justify-start text-sm"
                  >
                    <span className="mr-2">{emoji} {formatOptionName(option)}?</span>
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
              );
            })}
          </div>
        </div>
        
        {/* Building Count */}
        <div className="mb-6">
          <Label htmlFor="building_count" className="text-sm font-medium text-gray-700 mb-2 block flex items-center">
            <span className="mr-2">🏢</span> Building Count
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
            <span className="mr-2">🔧</span>
            Installation/Hardware Scope
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.installation.map((option) => {
              const emoji = getOptionEmoji(option);
              return (
                <div className="flex items-center" key={option}>
                  <Toggle
                    pressed={configOptions[option as keyof typeof configOptions]}
                    onPressedChange={(pressed) => 
                      handleConfigChange(option as keyof typeof configOptions, pressed)
                    }
                    variant="red"
                    className="w-full justify-start text-sm"
                  >
                    <span className="mr-2">{emoji} {formatOptionName(option)}?</span>
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
              );
            })}
          </div>
        </div>

        {/* Access Control/Identity Management */}
        <div>
          <h4 className="text-md font-medium text-red-700 mb-3 flex items-center">
            <span className="mr-2">🔐</span>
            Access Control/Identity Management
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {categories.access_control.map((option) => {
              const emoji = getOptionEmoji(option);
              return (
                <div className="flex items-center" key={option}>
                  <Toggle
                    pressed={configOptions[option as keyof typeof configOptions]}
                    onPressedChange={(pressed) => 
                      handleConfigChange(option as keyof typeof configOptions, pressed)
                    }
                    variant="blue"
                    className="w-full justify-start text-sm"
                  >
                    <span className="mr-2">{emoji} {formatOptionName(option)}?</span>
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
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
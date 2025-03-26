import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useProject } from "@/context/ProjectContext";
import { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDown, Printer } from "lucide-react";

interface CameraScheduleItem {
  id: number;
  location: string;
  camera_type: string;
  mounting_type: string;
  resolution: string;
  field_of_view: string;
  notes: string;
}

interface CameraScheduleData {
  project: Project;
  cameras: CameraScheduleItem[];
}

export default function CameraSchedules() {
  const { currentProject } = useProject();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    currentProject?.id || null
  );
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch all projects for the dropdown
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  // Fetch camera schedule for the selected project
  const { data: cameraSchedule, isLoading: isLoadingSchedule } = useQuery<CameraScheduleData>({
    queryKey: [`/api/projects/${selectedProjectId}/reports/camera-schedule`],
    enabled: !!selectedProjectId,
  });
  
  // Filter camera items based on search term
  const filteredCameras = cameraSchedule?.cameras.filter((camera) =>
    camera.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    camera.camera_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (camera.mounting_type && camera.mounting_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (camera.resolution && camera.resolution.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];
  
  // Handle print function
  const handlePrint = () => {
    window.print();
  };
  
  // Handle export to CSV
  const handleExportCSV = () => {
    if (!cameraSchedule) return;
    
    // Create CSV content
    const headers = ["Location", "Camera Type", "Mounting Type", "Resolution", "Field of View", "Notes"];
    const rows = cameraSchedule.cameras.map(camera => [
      camera.location,
      camera.camera_type,
      camera.mounting_type || "N/A",
      camera.resolution || "N/A",
      camera.field_of_view || "N/A",
      camera.notes || ""
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell?.replace(/"/g, '""') || ""}"`).join(","))
    ].join("\n");
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `camera-schedule-${cameraSchedule.project.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Camera Schedules</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center"
            onClick={handlePrint}
            disabled={!cameraSchedule}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            className="flex items-center"
            onClick={handleExportCSV}
            disabled={!cameraSchedule}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Generate Camera Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Select Project
              </label>
              <Select
                value={selectedProjectId?.toString() || ""}
                onValueChange={(value) => setSelectedProjectId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingProjects ? (
                    <SelectItem value="loading">Loading projects...</SelectItem>
                  ) : projects.length === 0 ? (
                    <SelectItem value="none" disabled>No projects available</SelectItem>
                  ) : (
                    projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search camera schedule"
                  className="pl-10 pr-4 py-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={!cameraSchedule}
                />
                <span className="material-icons absolute left-3 top-2 text-neutral-400">
                  search
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {!selectedProjectId ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="material-icons text-6xl text-neutral-300 mb-4">
              assignment
            </div>
            <h3 className="text-lg font-medium mb-2">No Project Selected</h3>
            <p className="text-neutral-500">
              Please select a project to generate a camera schedule.
            </p>
          </CardContent>
        </Card>
      ) : isLoadingSchedule ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="material-icons text-4xl animate-spin text-primary mb-4">
              sync
            </div>
            <p className="text-neutral-600">Loading camera schedule...</p>
          </div>
        </div>
      ) : !cameraSchedule || cameraSchedule.cameras.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="material-icons text-6xl text-neutral-300 mb-4">
              videocam
            </div>
            <h3 className="text-lg font-medium mb-2">No Cameras</h3>
            <p className="text-neutral-500">
              {cameraSchedule
                ? "This project doesn't have any cameras."
                : "Failed to load camera schedule."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="print:shadow-none">
          <div className="mb-4 print:mb-8 print:text-center">
            <h3 className="text-xl font-bold print:text-2xl">
              Camera Schedule: {cameraSchedule.project.name}
            </h3>
            {cameraSchedule.project.client && (
              <p className="text-neutral-500 print:text-lg">
                Client: {cameraSchedule.project.client}
              </p>
            )}
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-sm text-left print:text-xs">
              <thead className="text-xs text-neutral-700 uppercase bg-neutral-100 print:bg-neutral-200">
                <tr>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap print:px-2 print:py-2">
                    Location
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap print:px-2 print:py-2">
                    Camera Type
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap print:px-2 print:py-2">
                    Mounting Type
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap print:px-2 print:py-2">
                    Resolution
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap print:px-2 print:py-2">
                    Field of View
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap print:px-2 print:py-2">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCameras.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      No cameras match your search.
                    </td>
                  </tr>
                ) : (
                  filteredCameras.map((camera) => (
                    <tr key={camera.id} className="border-b hover:bg-neutral-50 print:hover:bg-transparent">
                      <td className="px-4 py-3 font-medium print:px-2 print:py-2">
                        {camera.location}
                      </td>
                      <td className="px-4 py-3 print:px-2 print:py-2">
                        {camera.camera_type}
                      </td>
                      <td className="px-4 py-3 print:px-2 print:py-2">
                        {camera.mounting_type || "N/A"}
                      </td>
                      <td className="px-4 py-3 print:px-2 print:py-2">
                        {camera.resolution || "N/A"}
                      </td>
                      <td className="px-4 py-3 print:px-2 print:py-2">
                        {camera.field_of_view || "N/A"}
                      </td>
                      <td className="px-4 py-3 print:px-2 print:py-2">
                        {camera.notes || ""}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-sm text-neutral-500 print:mt-8 print:text-center print:text-xs">
            <p>
              Generated on{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

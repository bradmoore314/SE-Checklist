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
import { exportDoorScheduleToTemplate } from "@/utils/exportUtils";

interface DoorScheduleItem {
  id: number;
  location: string;
  door_type: string;
  reader_type: string;
  lock_type: string;
  security_level: string;
  ppi: string;
  notes: string;
}

interface DoorScheduleData {
  project: Project;
  doors: DoorScheduleItem[];
}

export default function DoorSchedules() {
  const { currentProject } = useProject();
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    currentProject?.id || null
  );
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch all projects for the dropdown
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  // Fetch door schedule for the selected project
  const { data: doorSchedule, isLoading: isLoadingSchedule } = useQuery<DoorScheduleData>({
    queryKey: [`/api/projects/${selectedProjectId}/reports/door-schedule`],
    enabled: !!selectedProjectId,
  });
  
  // Filter door items based on search term
  const filteredDoors = doorSchedule?.doors.filter((door) =>
    door.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    door.door_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    door.reader_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    door.lock_type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  // Handle print function
  const handlePrint = () => {
    window.print();
  };
  
  // Handle export to CSV
  const handleExportCSV = () => {
    if (!doorSchedule) return;
    
    // Create CSV content
    const headers = ["Location", "Door Type", "Reader Type", "Lock Type", "Security Level", "PPI", "Notes"];
    const rows = doorSchedule.doors.map(door => [
      door.location,
      door.door_type,
      door.reader_type,
      door.lock_type,
      door.security_level,
      door.ppi,
      door.notes
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
    link.setAttribute('download', `door-schedule-${doorSchedule.project.name}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle export to Kastle Excel template
  const handleExportToTemplate = async () => {
    if (!doorSchedule) return;

    try {
      // Use the template from the public assets folder
      const templateUrl = '/assets/DoorScheduleTemplate.xlsx';
      
      // Prepare and export door data to the template
      await exportDoorScheduleToTemplate(
        doorSchedule.doors, 
        doorSchedule.project.name,
        templateUrl
      );
      
    } catch (error) {
      console.error('Error exporting to template:', error);
      alert('Failed to export to template. Please ensure the template file is accessible.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Door Schedules</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="flex items-center"
            onClick={handlePrint}
            disabled={!doorSchedule}
          >
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button
            variant="outline"
            className="flex items-center"
            onClick={handleExportCSV}
            disabled={!doorSchedule}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            className="flex items-center"
            onClick={handleExportToTemplate}
            disabled={!doorSchedule}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export to Template
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-medium">
            Generate Door Schedule
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
                  placeholder="Search door schedule"
                  className="pl-10 pr-4 py-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={!doorSchedule}
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
              Please select a project to generate a door schedule.
            </p>
          </CardContent>
        </Card>
      ) : isLoadingSchedule ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="material-icons text-4xl animate-spin text-primary mb-4">
              sync
            </div>
            <p className="text-neutral-600">Loading door schedule...</p>
          </div>
        </div>
      ) : !doorSchedule || doorSchedule.doors.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="material-icons text-6xl text-neutral-300 mb-4">
              door_front
            </div>
            <h3 className="text-lg font-medium mb-2">No Access Points</h3>
            <p className="text-neutral-500">
              {doorSchedule
                ? "This project doesn't have any access points."
                : "Failed to load door schedule."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="print:shadow-none">
          <div className="mb-4 print:mb-8 print:text-center">
            <h3 className="text-xl font-bold print:text-2xl">
              Door Schedule: {doorSchedule.project.name}
            </h3>
            {doorSchedule.project.client && (
              <p className="text-neutral-500 print:text-lg">
                Client: {doorSchedule.project.client}
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
                    Door Type
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap print:px-2 print:py-2">
                    Reader Type
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap print:px-2 print:py-2">
                    Lock Type
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap print:px-2 print:py-2">
                    Security Level
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap print:px-2 print:py-2">
                    PPI
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap print:px-2 print:py-2">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredDoors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      No access points match your search.
                    </td>
                  </tr>
                ) : (
                  filteredDoors.map((door) => (
                    <tr key={door.id} className="border-b hover:bg-neutral-50 print:hover:bg-transparent">
                      <td className="px-4 py-3 font-medium print:px-2 print:py-2">
                        {door.location}
                      </td>
                      <td className="px-4 py-3 print:px-2 print:py-2">
                        {door.door_type}
                      </td>
                      <td className="px-4 py-3 print:px-2 print:py-2">
                        {door.reader_type}
                      </td>
                      <td className="px-4 py-3 print:px-2 print:py-2">
                        {door.lock_type}
                      </td>
                      <td className="px-4 py-3 print:px-2 print:py-2">
                        {door.security_level}
                      </td>
                      <td className="px-4 py-3 print:px-2 print:py-2">
                        {door.ppi || "None"}
                      </td>
                      <td className="px-4 py-3 print:px-2 print:py-2">
                        {door.notes || ""}
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

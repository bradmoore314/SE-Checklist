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
  
  // Add door number for each door in the list (same as in the image)
  const numberedDoors = filteredDoors.map((door, index) => ({
    ...door,
    doorNumber: index + 1
  }));
  
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
            <h3 className="text-xl font-bold print:text-2xl text-center border-b-2 pb-2 mb-2">
              Kastle Security Door Information
            </h3>
            {doorSchedule.project.client && (
              <p className="text-neutral-500 print:text-lg mb-4">
                Client: {doorSchedule.project.client}
              </p>
            )}
          </div>

          <div className="overflow-x-auto print:overflow-visible">
            <table className="w-full text-sm border-collapse border border-gray-800 print:text-xs">
              {/* Main table with fancy borders exactly matching the image */}
              <thead>
                <tr>
                  {/* Left section - Door Information */}
                  <th colSpan={8} className="border border-gray-800 bg-white text-center py-1 font-bold text-base">
                    Kastle Security Door Information
                  </th>
                  {/* Middle section - Install Requirements */}
                  <th colSpan={5} className="border border-gray-800 bg-white text-center py-1 font-bold text-sm">
                    Needed for Install
                  </th>
                  {/* Right section - Camera */}
                  <th colSpan={2} className="border border-gray-800 bg-white text-center py-1 font-bold text-sm">
                    &nbsp;
                  </th>
                </tr>
                <tr className="bg-white">
                  {/* Door number column */}
                  <th className="border border-gray-800 px-2 py-1 text-center align-middle w-10 font-bold rotate-90 h-24">
                    <div>Door Number</div>
                  </th>
                  
                  {/* Door details */}
                  <th className="border border-gray-800 px-2 py-1 text-center w-32 font-bold">
                    Door Name
                  </th>
                  <th className="border border-gray-800 px-2 py-1 text-center w-16 font-bold">
                    Floor
                  </th>
                  <th className="border border-gray-800 px-2 py-1 text-center w-20 font-bold">
                    Door Type
                  </th>
                  <th className="border border-gray-800 px-2 py-1 text-center w-24 font-bold">
                    Install Type
                  </th>
                  <th className="border border-gray-800 px-2 py-1 text-center w-24 font-bold">
                    Reader
                  </th>
                  <th className="border border-gray-800 px-2 py-1 text-center align-middle w-16 font-bold rotate-90 h-24">
                    <div>Mounting Reader</div>
                  </th>
                  <th className="border border-gray-800 px-2 py-1 text-center align-middle w-16 font-bold rotate-90 h-24">
                    <div>Exit Reader</div>
                  </th>
                  
                  {/* Lock Type */}
                  <th className="border border-gray-800 px-2 py-1 text-center w-24 font-bold">
                    Lock Type
                  </th>
                  
                  {/* Needed for Install Columns */}
                  <th className="border border-gray-800 px-2 py-1 text-center align-middle w-16 font-bold rotate-90 h-24">
                    <div>Door Contact</div>
                  </th>
                  <th className="border border-gray-800 px-2 py-1 text-center align-middle w-16 font-bold rotate-90 h-24">
                    <div>REX</div>
                  </th>
                  <th className="border border-gray-800 px-2 py-1 text-center align-middle w-16 font-bold rotate-90 h-24">
                    <div>Push to Exit</div>
                  </th>
                  <th className="border border-gray-800 px-2 py-1 text-center align-middle w-16 font-bold rotate-90 h-24">
                    <div>Intercom</div>
                  </th>
                  <th className="border border-gray-800 px-2 py-1 text-center align-middle w-16 font-bold rotate-90 h-24">
                    <div>Door Bell</div>
                  </th>
                  
                  {/* Camera and Notes */}
                  <th className="border border-gray-800 px-2 py-1 text-center w-28 font-bold">
                    Associated Camera
                  </th>
                  <th className="border border-gray-800 px-2 py-1 text-center w-40 font-bold">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {numberedDoors.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="px-4 py-8 text-center border border-gray-800">
                      No access points match your search.
                    </td>
                  </tr>
                ) : (
                  numberedDoors.map((door) => (
                    <tr key={door.id} className="border-b hover:bg-neutral-50 print:hover:bg-transparent">
                      {/* Door Number */}
                      <td className="border border-gray-800 px-2 py-2 text-center">
                        {door.doorNumber}
                      </td>
                      
                      {/* Door Information */}
                      <td className="border border-gray-800 px-2 py-2 text-sm">
                        {door.location}
                      </td>
                      <td className="border border-gray-800 px-2 py-2 text-center">
                        {/* Floor field - editable */}
                        <div contentEditable={true} className="min-h-[20px] focus:outline-none focus:bg-blue-50 w-full"></div>
                      </td>
                      <td className="border border-gray-800 px-2 py-2 text-center">
                        {door.door_type || "Access Control"}
                      </td>
                      <td className="border border-gray-800 px-2 py-2 text-center">
                        {door.security_level === "High" ? "New Install" : door.security_level === "Medium" ? "Takeover" : "Installed/Existing Lock"}
                      </td>
                      <td className="border border-gray-800 px-2 py-2 text-center">
                        {door.reader_type || "KR-100"}
                      </td>
                      <td className="border border-gray-800 px-2 py-2 text-center">
                        {/* Mounting Reader - Checkbox */}
                        <div className="flex justify-center">
                          <input type="checkbox" className="h-4 w-4 border border-gray-400 cursor-pointer" />
                        </div>
                      </td>
                      <td className="border border-gray-800 px-2 py-2 text-center">
                        {/* Exit Reader - Checkbox */}
                        <div className="flex justify-center">
                          <input type="checkbox" className="h-4 w-4 border border-gray-400 cursor-pointer" />
                        </div>
                      </td>
                      
                      {/* Lock Type */}
                      <td className="border border-gray-800 px-2 py-2 text-center">
                        {door.lock_type || "Single Mag"}
                      </td>
                      
                      {/* Needed for Install - All Checkboxes */}
                      <td className="border border-gray-800 px-2 py-2 text-center">
                        <div className="flex justify-center">
                          <input type="checkbox" className="h-4 w-4 border border-gray-400 cursor-pointer" />
                        </div>
                      </td>
                      <td className="border border-gray-800 px-2 py-2 text-center">
                        <div className="flex justify-center">
                          <input type="checkbox" className="h-4 w-4 border border-gray-400 cursor-pointer" />
                        </div>
                      </td>
                      <td className="border border-gray-800 px-2 py-2 text-center">
                        <div className="flex justify-center">
                          <input type="checkbox" className="h-4 w-4 border border-gray-400 cursor-pointer" />
                        </div>
                      </td>
                      <td className="border border-gray-800 px-2 py-2 text-center">
                        <div className="flex justify-center">
                          <input type="checkbox" className="h-4 w-4 border border-gray-400 cursor-pointer" />
                        </div>
                      </td>
                      <td className="border border-gray-800 px-2 py-2 text-center">
                        <div className="flex justify-center">
                          <input type="checkbox" className="h-4 w-4 border border-gray-400 cursor-pointer" />
                        </div>
                      </td>
                      
                      {/* Associated Camera */}
                      <td className="border border-gray-800 px-2 py-2 text-center">
                        <div contentEditable={true} className="min-h-[20px] focus:outline-none focus:bg-blue-50 w-full"></div>
                      </td>
                      
                      {/* Notes */}
                      <td className="border border-gray-800 px-2 py-2 text-sm">
                        {door.notes || <div contentEditable={true} className="min-h-[20px] focus:outline-none focus:bg-blue-50 w-full"></div>}
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

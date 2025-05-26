import { useState } from "react";
import { Camera, Project } from "@shared/schema";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddCameraModal from "../modals/AddCameraModal";
import EditCameraModal from "../modals/EditCameraModal";
// CombinedCameraConfigForm removed with floorplans feature
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Plus, Search, Video, Edit, Copy, Trash, FileDown } from "lucide-react";
import * as XLSX from 'xlsx';

interface CamerasTabProps {
  project: Project;
}

export default function CamerasTab({ project }: CamerasTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Function to export cameras to Excel
  const handleExportToTemplate = async () => {
    if (filteredCameras.length === 0) {
      toast({
        title: "Export Failed",
        description: "No cameras available to export.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create a new workbook for the template format requested
      const wb = XLSX.utils.book_new();
      
      // Create a new worksheet with template header
      // Header row matches exactly the template requested for camera schedule
      const header = [
        "Device Number", "Camera Name", "Camera Type", "Camera Model", "Location", 
        "POE or Power Adapter", "Location of Power Source", "Mounting Height", 
        "Motion Detection", "NVR Assignment", "IP Address", "View Perspective", "Additional Details"
      ];
      
      const data = [header];
      
      // Add data rows for each camera
      filteredCameras.forEach((cam, index) => {
        const row = [
          (index + 1).toString(), // Device Number (sequential)
          cam.location || "", // Camera Name (using location field)
          mapCameraType(cam.camera_type || ""), // Camera Type
          cam.camera_model || "", // Camera Model 
          cam.location || "", // Location
          "", // POE or Power Adapter (empty for user to fill)
          "", // Location of Power Source (empty for user to fill)
          cam.mounting_height || "", // Mounting Height
          cam.motion_detection ? "Yes" : "No", // Motion Detection
          "", // NVR Assignment (empty for user to fill)
          cam.ip_address || "", // IP Address
          cam.view_perspective || "", // View Perspective
          cam.notes || "" // Additional Details (using notes field)
        ];
        
        data.push(row);
      });
      
      // Create worksheet with exact template layout
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      
      // Add title row above the header
      XLSX.utils.sheet_add_aoa(worksheet, [["Kastle Security Camera Information"]], { origin: "A1" });
      
      // Merge cells for title
      if (!worksheet['!merges']) worksheet['!merges'] = [];
      worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }); // Merge A1:G1 for title
      
      // Style formatting for heading
      const title_cell = worksheet.A1;
      if (title_cell) {
        title_cell.s = {
          font: { bold: true, sz: 14 },
          alignment: { horizontal: "center" }
        };
      }
      
      // Set column widths to make it look nice
      const cols = [
        { wch: 12 }, // Device Number
        { wch: 25 }, // Camera Name
        { wch: 18 }, // Camera Type
        { wch: 18 }, // Camera Model
        { wch: 20 }, // Location
        { wch: 18 }, // POE or Power Adapter
        { wch: 20 }, // Location of Power Source
        { wch: 15 }, // Mounting Height
        { wch: 18 }, // Motion Detection
        { wch: 18 }, // NVR Assignment
        { wch: 15 }, // IP Address
        { wch: 20 }, // View Perspective
        { wch: 25 }  // Additional Details
      ];
      worksheet['!cols'] = cols;
      
      // Add to workbook
      XLSX.utils.book_append_sheet(wb, worksheet, "Camera Schedule");
      
      // Generate filename
      const fileName = `${project.name.replace(/[^a-z0-9]/gi, '_')}_Camera_Schedule.xlsx`;
      
      // Write and download the file
      XLSX.writeFile(wb, fileName);
      
      toast({
        title: "Export Successful",
        description: `Camera schedule exported to ${fileName}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: (error as Error).message || "Failed to export camera schedule",
        variant: "destructive"
      });
    }
  };
  
  // Helper mapping functions to convert our terms to template-specific terms
  function mapCameraType(type: string | null): string {
    if (!type) return '';
    
    switch (type) {
      case 'Indoor Single Lens': return 'Indoor Fixed';
      case 'Outdoor Single Lens': return 'Outdoor Fixed';
      case 'Indoor Multi-Lens': return 'Indoor Panoramic';
      case 'Outdoor Multi-Lens': return 'Outdoor Panoramic';
      case 'PTZ': return 'PTZ';
      default: return type;
    }
  }
  
  function mapAccessibilityLevel(level: string | null): string {
    if (!level) return '';
    
    switch (level) {
      case 'Secure - Locked Down Indoor': return 'Level 1 - Restricted';
      case 'Secure - Building Entrance': return 'Level 2 - Controlled';
      case 'Public Area - Indoor': return 'Level 3 - Public Indoor';
      case 'Public Area - Outdoor': return 'Level 4 - Public Outdoor';
      default: return level;
    }
  }

  // Fetch cameras
  const { data: cameras = [], isLoading, isError } = useQuery({
    queryKey: [`/api/projects/${project.id}/cameras`],
    enabled: !!project.id,
  });

  // Filter cameras based on search term
  const filteredCameras = cameras.filter((cam: Camera) => 
    cam.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cam.camera_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cam.mounting_type && cam.mounting_type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination
  const totalPages = Math.ceil(filteredCameras.length / itemsPerPage);
  const paginatedCameras = filteredCameras.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle camera deletion
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this camera?")) {
      try {
        await apiRequest("DELETE", `/api/cameras/${id}`);
        
        // Invalidate and refetch
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${project.id}/cameras`]
        });
        
        toast({
          title: "Camera Deleted",
          description: "The camera has been deleted successfully.",
        });
      } catch (error) {
        toast({
          title: "Deletion Failed",
          description: (error as Error).message,
          variant: "destructive",
        });
      }
    }
  };

  // Add camera mutation
  const addCameraMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Making API call to add camera with data:", data);
      const response = await apiRequest('POST', `/api/projects/${project.id}/cameras`, {
        ...data,
        project_id: project.id
      });
      if (!response.ok) {
        throw new Error('Failed to add camera');
      }
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Camera added successfully with ID:", data.id);
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ 
        queryKey: [`/api/projects/${project.id}/cameras`]
      });
      
      toast({
        title: "Camera Added",
        description: "The camera has been added successfully.",
      });
    },
    onError: (error) => {
      console.error("Error adding camera:", error);
      toast({
        title: "Failed to Add Camera",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Handle save from add modal
  const handleSave = (newData: Camera) => {
    console.log("Adding new camera with data:", newData);
    addCameraMutation.mutate(newData);
    setShowAddModal(false);
  };
  
  // Handle save from edit modal
  const handleEditSave = (id: number, updatedData: Camera) => {
    console.log("Camera updated:", id, updatedData);
    
    // Close modal
    setShowEditModal(false);
    setSelectedCamera(null);
    
    // Invalidate and refetch
    queryClient.invalidateQueries({ 
      queryKey: [`/api/projects/${project.id}/cameras`]
    });
    
    toast({
      title: "Camera Updated",
      description: "The camera has been updated successfully.",
    });
  };

  // Calculate statistics for cameras
  const calculateStats = () => {
    if (!cameras.length) return {
      total: 0,
      cameraTypes: {},
      mountingTypes: {},
      resolutions: {},
      fieldOfViews: {},
      indoor: 0,
      outdoor: 0,
      importToGateway: 0
    };
    
    const stats = {
      total: cameras.length,
      cameraTypes: {} as Record<string, number>,
      mountingTypes: {} as Record<string, number>,
      resolutions: {} as Record<string, number>,
      fieldOfViews: {} as Record<string, number>,
      indoor: 0,
      outdoor: 0,
      importToGateway: 0
    };
    
    cameras.forEach((cam: Camera) => {
      // Camera Types
      if (cam.camera_type) {
        stats.cameraTypes[cam.camera_type] = (stats.cameraTypes[cam.camera_type] || 0) + 1;
      }
      
      // Mounting Types
      if (cam.mounting_type) {
        stats.mountingTypes[cam.mounting_type] = (stats.mountingTypes[cam.mounting_type] || 0) + 1;
      }
      
      // Resolutions
      if (cam.resolution) {
        stats.resolutions[cam.resolution] = (stats.resolutions[cam.resolution] || 0) + 1;
      }
      
      // Field of Views
      if (cam.field_of_view) {
        stats.fieldOfViews[cam.field_of_view] = (stats.fieldOfViews[cam.field_of_view] || 0) + 1;
      }
      
      // Indoor/Outdoor counts
      if (cam.is_indoor === true) stats.indoor++;
      else if (cam.is_indoor === false) stats.outdoor++;
      
      // Import to Gateway count
      if (cam.import_to_gateway === true) stats.importToGateway++;
    });
    
    return stats;
  };
  
  const stats = calculateStats();

  return (
    <Card className="shadow-sm border-gray-100">
      {/* Statistics Dashboard */}
      <div className="p-5 border-b border-gray-100">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Project Cameras Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          {/* Total Count */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="text-sm text-blue-600 font-medium">Total Cameras</div>
            <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
          </div>
          
          {/* Indoor vs Outdoor */}
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="text-sm text-green-600 font-medium">Indoor Cameras</div>
            <div className="text-2xl font-bold text-green-700">{stats.indoor}</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="text-sm text-purple-600 font-medium">Outdoor Cameras</div>
            <div className="text-2xl font-bold text-purple-700">{stats.outdoor}</div>
          </div>
          
          {/* Unassigned Indoor/Outdoor */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="text-sm text-gray-600 font-medium">Unspecified Location</div>
            <div className="text-2xl font-bold text-gray-700">
              {stats.total - stats.indoor - stats.outdoor}
            </div>
          </div>
          
          {/* Gateway Import */}
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <div className="text-sm text-amber-600 font-medium">Import to Gateway</div>
            <div className="text-2xl font-bold text-amber-700">{stats.importToGateway}</div>
          </div>
        </div>
        
        {/* Detailed Breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Camera Types */}
          <div className="border border-gray-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Camera Types</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {Object.entries(stats.cameraTypes).map(([type, count]) => (
                <div key={`camera-type-${type}`} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{type}</span>
                  <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{count}</span>
                </div>
              ))}
              {Object.keys(stats.cameraTypes).length === 0 && (
                <div className="text-sm text-gray-500 italic">No data available</div>
              )}
            </div>
          </div>
          
          {/* Mounting Types */}
          <div className="border border-gray-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Mounting Types</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {Object.entries(stats.mountingTypes).map(([type, count]) => (
                <div key={`mounting-type-${type}`} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{type}</span>
                  <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded">{count}</span>
                </div>
              ))}
              {Object.keys(stats.mountingTypes).length === 0 && (
                <div className="text-sm text-gray-500 italic">No data available</div>
              )}
            </div>
          </div>
          
          {/* Resolutions */}
          <div className="border border-gray-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Resolutions</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {Object.entries(stats.resolutions).map(([resolution, count]) => (
                <div key={`resolution-${resolution}`} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{resolution}</span>
                  <span className="text-sm font-medium bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{count}</span>
                </div>
              ))}
              {Object.keys(stats.resolutions).length === 0 && (
                <div className="text-sm text-gray-500 italic">No data available</div>
              )}
            </div>
          </div>
          
          {/* Field of Views */}
          <div className="border border-gray-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Field of Views</h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {Object.entries(stats.fieldOfViews).map(([fov, count]) => (
                <div key={`fov-${fov}`} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{fov}</span>
                  <span className="text-sm font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded">{count}</span>
                </div>
              ))}
              {Object.keys(stats.fieldOfViews).length === 0 && (
                <div className="text-sm text-gray-500 italic">No data available</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <CardHeader className="flex flex-row items-center justify-between p-5 bg-white border-b border-gray-100">
        <div>
          <CardTitle className="text-xl font-medium text-gray-800">Cameras</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Manage camera equipment for this project
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search cameras"
              className="pl-9 pr-4 py-2 h-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          <Button 
            variant="outline"
            className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            onClick={handleExportToTemplate}
            disabled={filteredCameras.length === 0}
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
            onClick={() => setLocation("/camera-stream-gateway")}
          >
            <Video className="mr-2 h-4 w-4" />
            Gateway Calculator
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Camera
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 pb-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 border-t-2 border-b-2 border-gray-300 rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500">Loading cameras...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-red-100 p-3 mb-3">
                <span className="text-red-500 text-xl">!</span>
              </div>
              <p className="text-red-600 font-medium">Error loading cameras</p>
              <p className="text-sm text-gray-500 mt-1">Please try again later</p>
            </div>
          </div>
        ) : paginatedCameras.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-3">
                <Video className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No cameras found</p>
              <p className="text-sm text-gray-500 mt-1 max-w-md">
                {searchTerm ? "No cameras match your search criteria." : "No cameras have been added to this project yet."}
              </p>
              {!searchTerm && (
                <Button 
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Camera
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-primary">
                  <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">
                    LOCATION
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">
                    CAMERA TYPE
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">
                    MOUNTING TYPE
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">
                    RESOLUTION
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">
                    FIELD OF VIEW
                  </th>
                  <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white text-right">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedCameras.map((camera: Camera) => (
                  <tr key={camera.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="text-blue-600">{camera.location || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{camera.camera_type}</td>
                    <td className="px-4 py-3 text-gray-700">{camera.mounting_type || "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{camera.resolution || "—"}</td>
                    <td className="px-4 py-3 text-gray-700">{camera.field_of_view || "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedCamera(camera);
                            setShowEditModal(true);
                          }}
                          className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            try {
                              await apiRequest("POST", `/api/cameras/${camera.id}/duplicate`);
                              
                              // Invalidate and refetch
                              queryClient.invalidateQueries({ 
                                queryKey: [`/api/projects/${project.id}/cameras`]
                              });
                              
                              toast({
                                title: "Camera Duplicated",
                                description: "The camera has been duplicated successfully.",
                              });
                            } catch (error) {
                              toast({
                                title: "Duplication Failed",
                                description: (error as Error).message,
                                variant: "destructive",
                              });
                            }
                          }}
                          className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(camera.id)}
                          className="h-8 w-8 rounded-full text-gray-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {filteredCameras.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredCameras.length)}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredCameras.length)}</span> of <span className="font-medium">{filteredCameras.length}</span> cameras
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="text-gray-500 border-gray-200"
              >
                Previous
              </Button>
              
              {/* Page buttons */}
              {[...Array(Math.min(totalPages, 3))].map((_, index) => {
                const pageNum = currentPage > 2 && totalPages > 3
                  ? currentPage - 1 + index
                  : index + 1;

                if (pageNum <= totalPages) {
                  return (
                    <Button 
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className={currentPage === pageNum 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "text-gray-500 border-gray-200"}
                    >
                      {pageNum}
                    </Button>
                  );
                }
                return null;
              })}
              
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="text-gray-500 border-gray-200"
              >
                Next
              </Button>
            </div>
          </div>
        )}

      </CardContent>
      
      {/* Add Camera Modal */}
      {showAddModal && (
        <AddCameraModal
          open={showAddModal}
          onOpenChange={(open) => {
            if (!open) setShowAddModal(false);
          }}
          projectId={project.id}
          onSave={(updatedData) => handleSave(updatedData)}
        />
      )}
      
      {/* Edit Camera Modal */}
      {showEditModal && selectedCamera && (
        <EditCameraModal
          open={showEditModal}
          onOpenChange={(open) => {
            if (!open) {
              setShowEditModal(false);
              setSelectedCamera(null);
            }
          }}
          cameraData={selectedCamera}
          floorplanId={null}
          markerId={null}
          projectId={project.id}
          onSave={(updatedData) => {
            handleEditSave(selectedCamera.id, updatedData);
          }}
          title={`Edit Camera - ${selectedCamera.location}`}
        />
      )}
    </Card>
  );
}

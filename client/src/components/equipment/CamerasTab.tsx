import { useState } from "react";
import { Camera, Project } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddCameraModal from "../modals/AddCameraModal";
import EditCameraModal from "../modals/EditCameraModal";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Plus, Search, Video, Edit, Copy, Trash } from "lucide-react";

interface CamerasTabProps {
  project: Project;
}

export default function CamerasTab({ project }: CamerasTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

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

  // Handle save from add modal
  const handleSave = () => {
    // Close modal
    setShowAddModal(false);
    
    // Invalidate and refetch
    queryClient.invalidateQueries({ 
      queryKey: [`/api/projects/${project.id}/cameras`]
    });
    
    toast({
      title: "Camera Added",
      description: "The camera has been added successfully.",
    });
  };
  
  // Handle save from edit modal
  const handleEditSave = () => {
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

  return (
    <Card className="shadow-sm border-gray-100">
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
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wide text-gray-700">
                    LOCATION
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wide text-gray-700">
                    CAMERA TYPE
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wide text-gray-700">
                    MOUNTING TYPE
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wide text-gray-700">
                    RESOLUTION
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wide text-gray-700">
                    FIELD OF VIEW
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wide text-gray-700 text-right">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCameras.map((camera: Camera) => (
                  <tr key={camera.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{camera.location}</td>
                    <td className="px-6 py-4 text-gray-700">{camera.camera_type}</td>
                    <td className="px-6 py-4 text-gray-700">{camera.mounting_type || "—"}</td>
                    <td className="px-6 py-4 text-gray-700">{camera.resolution || "—"}</td>
                    <td className="px-6 py-4 text-gray-700">{camera.field_of_view || "—"}</td>
                    <td className="px-6 py-4 text-right">
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
          isOpen={showAddModal} 
          projectId={project.id} 
          onSave={handleSave} 
          onClose={() => setShowAddModal(false)} 
        />
      )}
      
      {/* Edit Camera Modal */}
      {showEditModal && selectedCamera && (
        <EditCameraModal 
          isOpen={showEditModal} 
          camera={selectedCamera} 
          onSave={handleEditSave} 
          onClose={() => {
            setShowEditModal(false);
            setSelectedCamera(null);
          }} 
        />
      )}
    </Card>
  );
}

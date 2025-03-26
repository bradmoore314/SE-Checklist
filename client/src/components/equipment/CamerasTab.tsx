import { useState } from "react";
import { Camera, Project } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddCameraModal from "../modals/AddCameraModal";
import { useToast } from "@/hooks/use-toast";

interface CamerasTabProps {
  project: Project;
}

export default function CamerasTab({ project }: CamerasTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch cameras
  const { data: cameras = [], isLoading } = useQuery({
    queryKey: [`/api/projects/${project.id}/cameras`],
    enabled: !!project.id,
  });

  // Filter cameras based on search term
  const filteredCameras = cameras.filter((cam: Camera) => 
    cam.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cam.camera_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Handle save from modal
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Cameras</h3>
        <div className="flex items-center">
          <div className="relative mr-2">
            <Input
              type="text"
              placeholder="Search cameras"
              className="pl-10 pr-4 py-2"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
            <span className="material-icons absolute left-3 top-2 text-neutral-400">search</span>
          </div>
          <Button 
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center"
            onClick={() => setShowAddModal(true)}
          >
            <span className="material-icons mr-1">add</span>
            Add Camera
          </Button>
        </div>
      </div>
      
      {/* Cameras Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-neutral-700 uppercase bg-neutral-100">
            <tr>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Location</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Camera Type</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Mounting Type</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Resolution</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Field of View</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">Loading cameras...</td>
              </tr>
            ) : paginatedCameras.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  {searchTerm ? "No cameras match your search." : "No cameras have been added yet."}
                </td>
              </tr>
            ) : (
              paginatedCameras.map((camera: Camera) => (
                <tr key={camera.id} className="border-b hover:bg-neutral-50">
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{camera.location}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{camera.camera_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{camera.mounting_type || "N/A"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{camera.resolution || "N/A"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{camera.field_of_view || "N/A"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button 
                      className="text-primary hover:text-primary-dark focus:outline-none mr-2"
                      onClick={() => {
                        // Edit functionality would go here
                        toast({ 
                          title: "Edit Feature",
                          description: "Edit functionality will be implemented in a future update." 
                        });
                      }}
                    >
                      <span className="material-icons text-sm">edit</span>
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                      onClick={() => handleDelete(camera.id)}
                    >
                      <span className="material-icons text-sm">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {filteredCameras.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-neutral-500">
            Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredCameras.length)}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredCameras.length)}</span> of <span className="font-medium">{filteredCameras.length}</span> cameras
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add Camera Modal */}
      {showAddModal && (
        <AddCameraModal 
          isOpen={showAddModal} 
          projectId={project.id} 
          onSave={handleSave} 
          onClose={() => setShowAddModal(false)} 
        />
      )}
    </div>
  );
}

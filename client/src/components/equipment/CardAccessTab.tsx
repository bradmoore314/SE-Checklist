import { useState } from "react";
import { AccessPoint, Project } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddAccessPointModal from "../modals/AddAccessPointModal";
import EditAccessPointModal from "../modals/EditAccessPointModal";
import { useToast } from "@/hooks/use-toast";

interface CardAccessTabProps {
  project: Project;
}

export default function CardAccessTab({ project }: CardAccessTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAccessPoint, setSelectedAccessPoint] = useState<AccessPoint | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch access points
  const { data: accessPoints = [], isLoading } = useQuery<AccessPoint[]>({
    queryKey: [`/api/projects/${project.id}/access-points`],
    enabled: !!project.id,
  });

  // Filter access points based on search term
  const filteredAccessPoints = accessPoints.filter((ap) => 
    ap.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ap.quick_config.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ap.reader_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredAccessPoints.length / itemsPerPage);
  const paginatedAccessPoints = filteredAccessPoints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle access point deletion
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this access point?")) {
      try {
        await apiRequest("DELETE", `/api/access-points/${id}`);
        
        // Invalidate and refetch access points and project summary
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${project.id}/access-points`]
        });
        queryClient.invalidateQueries({
          queryKey: [`/api/projects/${project.id}/reports/project-summary`]
        });
        
        toast({
          title: "Access Point Deleted",
          description: "The access point has been deleted successfully.",
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

  // Handle save from Add modal
  const handleAddSave = () => {
    // Close modal
    setShowAddModal(false);
    
    // Invalidate and refetch access points and project summary
    queryClient.invalidateQueries({ 
      queryKey: [`/api/projects/${project.id}/access-points`]
    });
    queryClient.invalidateQueries({
      queryKey: [`/api/projects/${project.id}/reports/project-summary`]
    });
    
    toast({
      title: "Access Point Added",
      description: "The access point has been added successfully.",
    });
  };
  
  // Handle save from Edit modal
  const handleEditSave = () => {
    // Close modal
    setShowEditModal(false);
    setSelectedAccessPoint(null);
    
    // Invalidate and refetch access points and project summary
    queryClient.invalidateQueries({ 
      queryKey: [`/api/projects/${project.id}/access-points`]
    });
    queryClient.invalidateQueries({
      queryKey: [`/api/projects/${project.id}/reports/project-summary`]
    });
    
    toast({
      title: "Access Point Updated",
      description: "The access point has been updated successfully.",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">Card Access Points</h3>
        <div className="flex items-center">
          <div className="relative mr-2">
            <div className="relative">
              <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
              <Input
                type="text"
                placeholder="Search access points"
                className="pl-10 pr-4 py-2"
                style={{ backgroundColor: 'var(--dark-grey)', borderColor: 'var(--medium-grey)' }}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
          </div>
          <Button 
            className="btn-primary px-4 py-2 rounded-md flex items-center"
            style={{ backgroundColor: 'var(--red-accent)', color: 'white' }}
            onClick={() => setShowAddModal(true)}
          >
            <span className="material-icons mr-1">add</span>
            Add Access Point
          </Button>
        </div>
      </div>
      
      {/* Access Points Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr style={{ backgroundColor: 'var(--darker-grey)' }}>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-gray-300">LOCATION</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-gray-300">QUICK CONFIG</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-gray-300">READER TYPE</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-gray-300">LOCK TYPE</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-gray-300">MONITORING</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-gray-300">TAKEOVER</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-gray-300">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr style={{ backgroundColor: 'var(--dark-grey)' }}>
                <td colSpan={7} className="px-4 py-8 text-center text-white">Loading access points...</td>
              </tr>
            ) : paginatedAccessPoints.length === 0 ? (
              <tr style={{ backgroundColor: 'var(--dark-grey)' }}>
                <td colSpan={7} className="px-4 py-8 text-center text-white">
                  {searchTerm ? "No access points match your search." : "No access points have been added yet."}
                </td>
              </tr>
            ) : (
              paginatedAccessPoints.map((ap: AccessPoint) => (
                <tr key={ap.id} className="text-white border-b" 
                    style={{ backgroundColor: 'var(--dark-grey)', borderColor: 'var(--medium-grey)' }}
                >
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-white">{ap.location}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{ap.quick_config}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{ap.reader_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{ap.lock_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{ap.monitoring_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{ap.takeover || 'No'}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button 
                      className="text-gray-300 hover:text-white focus:outline-none mr-2"
                      onClick={() => {
                        setSelectedAccessPoint(ap);
                        setShowEditModal(true);
                      }}
                    >
                      <span className="material-icons text-sm">edit</span>
                    </button>
                    <button 
                      className="text-gray-300 hover:text-white focus:outline-none mr-2"
                      onClick={async () => {
                        try {
                          await apiRequest("POST", `/api/access-points/${ap.id}/duplicate`);
                          
                          // Invalidate and refetch access points and project summary
                          queryClient.invalidateQueries({ 
                            queryKey: [`/api/projects/${project.id}/access-points`]
                          });
                          queryClient.invalidateQueries({
                            queryKey: [`/api/projects/${project.id}/reports/project-summary`]
                          });
                          
                          toast({
                            title: "Access Point Duplicated",
                            description: "The access point has been duplicated successfully.",
                          });
                        } catch (error) {
                          toast({
                            title: "Duplication Failed",
                            description: (error as Error).message,
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <span className="material-icons text-sm">content_copy</span>
                    </button>
                    <button 
                      className="focus:outline-none"
                      style={{ color: 'var(--red-accent)' }}
                      onClick={() => handleDelete(ap.id)}
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
      {filteredAccessPoints.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-zinc-400">
            Showing <span className="font-medium text-white">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredAccessPoints.length)}</span> to <span className="font-medium text-white">{Math.min(currentPage * itemsPerPage, filteredAccessPoints.length)}</span> of <span className="font-medium text-white">{filteredAccessPoints.length}</span> access points
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              className="border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
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
                    className={currentPage === pageNum 
                      ? "bg-red-600 hover:bg-red-700 text-white border-red-600" 
                      : "border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              }
              return null;
            })}
            
            <Button 
              className="border-zinc-700 text-white hover:bg-zinc-700 hover:text-white"
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

      {/* Add Access Point Modal */}
      {showAddModal && (
        <AddAccessPointModal 
          isOpen={showAddModal} 
          projectId={project.id} 
          onSave={handleAddSave} 
          onClose={() => setShowAddModal(false)} 
        />
      )}
      
      {/* Edit Access Point Modal */}
      {showEditModal && selectedAccessPoint && (
        <EditAccessPointModal 
          isOpen={showEditModal} 
          accessPoint={selectedAccessPoint} 
          onSave={handleEditSave} 
          onClose={() => {
            setShowEditModal(false);
            setSelectedAccessPoint(null);
          }} 
        />
      )}
    </div>
  );
}

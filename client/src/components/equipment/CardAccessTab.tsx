import { useState } from "react";
import { AccessPoint, Project } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddAccessPointModal from "../modals/AddAccessPointModal";
import { useToast } from "@/hooks/use-toast";

interface CardAccessTabProps {
  project: Project;
}

export default function CardAccessTab({ project }: CardAccessTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch access points
  const { data: accessPoints = [], isLoading } = useQuery({
    queryKey: [`/api/projects/${project.id}/access-points`],
    enabled: !!project.id,
  });

  // Filter access points based on search term
  const filteredAccessPoints = accessPoints.filter((ap: AccessPoint) => 
    ap.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ap.door_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        
        // Invalidate and refetch
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${project.id}/access-points`]
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

  // Handle save from modal
  const handleSave = () => {
    // Close modal
    setShowAddModal(false);
    
    // Invalidate and refetch
    queryClient.invalidateQueries({ 
      queryKey: [`/api/projects/${project.id}/access-points`]
    });
    
    toast({
      title: "Access Point Added",
      description: "The access point has been added successfully.",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Card Access Points</h3>
        <div className="flex items-center">
          <div className="relative mr-2">
            <Input
              type="text"
              placeholder="Search access points"
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
            Add Access Point
          </Button>
        </div>
      </div>
      
      {/* Access Points Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-neutral-700 uppercase bg-neutral-100">
            <tr>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Location</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Door Type</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Reader Type</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Lock Type</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Security Level</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">Loading access points...</td>
              </tr>
            ) : paginatedAccessPoints.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  {searchTerm ? "No access points match your search." : "No access points have been added yet."}
                </td>
              </tr>
            ) : (
              paginatedAccessPoints.map((ap: AccessPoint) => (
                <tr key={ap.id} className="border-b hover:bg-neutral-50">
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{ap.location}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{ap.door_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{ap.reader_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{ap.lock_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{ap.security_level}</td>
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
                      className="text-blue-500 hover:text-blue-700 focus:outline-none mr-2"
                      onClick={async () => {
                        try {
                          await apiRequest("POST", `/api/access-points/${ap.id}/duplicate`);
                          
                          // Invalidate and refetch
                          queryClient.invalidateQueries({ 
                            queryKey: [`/api/projects/${project.id}/access-points`]
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
                      className="text-red-500 hover:text-red-700 focus:outline-none"
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
          <div className="text-sm text-neutral-500">
            Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredAccessPoints.length)}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAccessPoints.length)}</span> of <span className="font-medium">{filteredAccessPoints.length}</span> access points
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

      {/* Add Access Point Modal */}
      {showAddModal && (
        <AddAccessPointModal 
          isOpen={showAddModal} 
          projectId={project.id} 
          onSave={handleSave} 
          onClose={() => setShowAddModal(false)} 
        />
      )}
    </div>
  );
}

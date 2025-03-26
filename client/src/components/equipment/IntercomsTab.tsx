import { useState } from "react";
import { Intercom, Project } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddIntercomModal from "../modals/AddIntercomModal";
import EditIntercomModal from "../modals/EditIntercomModal";
import { useToast } from "@/hooks/use-toast";

interface IntercomsTabProps {
  project: Project;
}

export default function IntercomsTab({ project }: IntercomsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingIntercom, setEditingIntercom] = useState<Intercom | null>(null);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch intercoms
  const { data: intercoms = [], isLoading } = useQuery({
    queryKey: [`/api/projects/${project.id}/intercoms`],
    enabled: !!project.id,
  });

  // Filter intercoms based on search term
  const filteredIntercoms = intercoms.filter((ic: Intercom) => 
    ic.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ic.intercom_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredIntercoms.length / itemsPerPage);
  const paginatedIntercoms = filteredIntercoms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle intercom deletion
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this intercom?")) {
      try {
        await apiRequest("DELETE", `/api/intercoms/${id}`);
        
        // Invalidate and refetch
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${project.id}/intercoms`]
        });
        
        toast({
          title: "Intercom Deleted",
          description: "The intercom has been deleted successfully.",
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
      queryKey: [`/api/projects/${project.id}/intercoms`]
    });
    
    toast({
      title: "Intercom Added",
      description: "The intercom has been added successfully.",
    });
  };
  
  // Handle click on edit button
  const handleEditClick = (intercom: Intercom) => {
    setEditingIntercom(intercom);
  };
  
  // Handle save from edit modal
  const handleEditSave = () => {
    // Close modal
    setEditingIntercom(null);
    
    // Invalidate and refetch
    queryClient.invalidateQueries({ 
      queryKey: [`/api/projects/${project.id}/intercoms`]
    });
    
    toast({
      title: "Intercom Updated",
      description: "The intercom has been updated successfully.",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Intercoms</h3>
        <div className="flex items-center">
          <div className="relative mr-2">
            <Input
              type="text"
              placeholder="Search intercoms"
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
            Add Intercom
          </Button>
        </div>
      </div>
      
      {/* Intercoms Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-neutral-700 uppercase bg-neutral-100">
            <tr>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Location</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Type</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Notes</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">Loading intercoms...</td>
              </tr>
            ) : paginatedIntercoms.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  {searchTerm ? "No intercoms match your search." : "No intercoms have been added yet."}
                </td>
              </tr>
            ) : (
              paginatedIntercoms.map((intercom: Intercom) => (
                <tr key={intercom.id} className="border-b hover:bg-neutral-50">
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{intercom.location}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{intercom.intercom_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{intercom.notes || "N/A"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button 
                      className="text-primary hover:text-primary-dark focus:outline-none mr-2"
                      onClick={() => handleEditClick(intercom)}
                    >
                      <span className="material-icons text-sm">edit</span>
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                      onClick={() => handleDelete(intercom.id)}
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
      {filteredIntercoms.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-neutral-500">
            Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredIntercoms.length)}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredIntercoms.length)}</span> of <span className="font-medium">{filteredIntercoms.length}</span> intercoms
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

      {/* Add Intercom Modal */}
      {showAddModal && (
        <AddIntercomModal 
          isOpen={showAddModal} 
          projectId={project.id} 
          onSave={handleSave} 
          onClose={() => setShowAddModal(false)} 
        />
      )}
      
      {/* Edit Intercom Modal */}
      {editingIntercom && (
        <EditIntercomModal
          isOpen={!!editingIntercom}
          intercom={editingIntercom}
          onSave={handleEditSave}
          onClose={() => setEditingIntercom(null)}
        />
      )}
    </div>
  );
}

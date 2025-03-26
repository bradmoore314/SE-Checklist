import { useState } from "react";
import { Elevator, Project } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddElevatorModal from "../modals/AddElevatorModal";
import EditElevatorModal from "../modals/EditElevatorModal";
import { useToast } from "@/hooks/use-toast";

interface ElevatorsTabProps {
  project: Project;
}

export default function ElevatorsTab({ project }: ElevatorsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedElevator, setSelectedElevator] = useState<Elevator | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch elevators
  const { data: elevators = [], isLoading } = useQuery({
    queryKey: [`/api/projects/${project.id}/elevators`],
    enabled: !!project.id,
  });

  // Filter elevators based on search term
  const filteredElevators = elevators.filter((el: Elevator) => 
    el.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    el.elevator_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredElevators.length / itemsPerPage);
  const paginatedElevators = filteredElevators.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle elevator deletion
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this elevator?")) {
      try {
        await apiRequest("DELETE", `/api/elevators/${id}`);
        
        // Invalidate and refetch
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${project.id}/elevators`]
        });
        
        toast({
          title: "Elevator Deleted",
          description: "The elevator has been deleted successfully.",
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
      queryKey: [`/api/projects/${project.id}/elevators`]
    });
    
    toast({
      title: "Elevator Added",
      description: "The elevator has been added successfully.",
    });
  };
  
  // Handle save from edit modal
  const handleEditSave = () => {
    // Close modal
    setShowEditModal(false);
    setSelectedElevator(null);
    
    // Invalidate and refetch
    queryClient.invalidateQueries({ 
      queryKey: [`/api/projects/${project.id}/elevators`]
    });
    
    toast({
      title: "Elevator Updated",
      description: "The elevator has been updated successfully.",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Elevators & Turnstiles</h3>
        <div className="flex items-center">
          <div className="relative mr-2">
            <Input
              type="text"
              placeholder="Search elevators"
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
            Add Elevator
          </Button>
        </div>
      </div>
      
      {/* Elevators Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-neutral-700 uppercase bg-neutral-100">
            <tr>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Location</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Type</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Floor Count</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Notes</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">Loading elevators...</td>
              </tr>
            ) : paginatedElevators.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  {searchTerm ? "No elevators match your search." : "No elevators have been added yet."}
                </td>
              </tr>
            ) : (
              paginatedElevators.map((elevator: Elevator) => (
                <tr key={elevator.id} className="border-b hover:bg-neutral-50">
                  <td className="px-4 py-3 whitespace-nowrap font-medium">{elevator.location}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{elevator.elevator_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{elevator.floor_count || "N/A"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{elevator.notes || "N/A"}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button 
                      className="text-primary hover:text-primary-dark focus:outline-none mr-2"
                      onClick={() => {
                        setSelectedElevator(elevator);
                        setShowEditModal(true);
                      }}
                    >
                      <span className="material-icons text-sm">edit</span>
                    </button>
                    <button 
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                      onClick={() => handleDelete(elevator.id)}
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
      {filteredElevators.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-neutral-500">
            Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredElevators.length)}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredElevators.length)}</span> of <span className="font-medium">{filteredElevators.length}</span> elevators
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

      {/* Add Elevator Modal */}
      {showAddModal && (
        <AddElevatorModal 
          isOpen={showAddModal} 
          projectId={project.id} 
          onSave={handleSave} 
          onClose={() => setShowAddModal(false)} 
        />
      )}
      
      {/* Edit Elevator Modal */}
      {showEditModal && selectedElevator && (
        <EditElevatorModal 
          isOpen={showEditModal} 
          elevator={selectedElevator} 
          onSave={handleEditSave} 
          onClose={() => {
            setShowEditModal(false);
            setSelectedElevator(null);
          }} 
        />
      )}
    </div>
  );
}

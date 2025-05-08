import { useState } from "react";
import { Elevator, Project } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddElevatorModal from "../modals/AddElevatorModal";
import EditElevatorModal from "../modals/EditElevatorModal";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Copy, Trash, ArrowUpDown } from "lucide-react";

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
  const { data: elevators = [], isLoading } = useQuery<Elevator[]>({
    queryKey: [`/api/projects/${project.id}/elevators`],
    enabled: !!project.id,
  });

  // Filter elevators based on search term
  const filteredElevators = elevators.filter((el: Elevator) => 
    (el.location?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (el.elevator_type?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
    <Card className="shadow-sm border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between p-5 bg-red-700 border-b border-gray-100">
        <div>
          <CardTitle className="text-xl font-medium text-white">Elevators & Turnstiles</CardTitle>
          <p className="text-sm text-white/80 mt-1">
            Manage elevator and turnstile equipment for this project
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search elevators"
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
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Elevator
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 pb-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 border-t-2 border-b-2 border-gray-300 rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500">Loading elevators...</p>
            </div>
          </div>
        ) : paginatedElevators.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-full bg-gray-100 p-3 mb-3">
                <ArrowUpDown className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No elevators found</p>
              <p className="text-sm text-gray-500 mt-1 max-w-md">
                {searchTerm ? "No elevators match your search criteria." : "No elevators have been added to this project yet."}
              </p>
              {!searchTerm && (
                <Button 
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Elevator
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
                    TITLE
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wide text-gray-700">
                    LOCATION
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wide text-gray-700">
                    TYPE
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wide text-gray-700">
                    BUILDING INFO
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wide text-gray-700">
                    MANAGEMENT COMPANY
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wide text-gray-700">
                    ELEVATOR COMPANY
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wide text-gray-700">
                    SECURITY
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wide text-gray-700">
                    FREIGHT CAR
                  </th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold tracking-wide text-gray-700 text-right">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedElevators.map((elevator: Elevator) => (
                  <tr key={elevator.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{elevator.title || "—"}</td>
                    <td className="px-6 py-4 text-gray-700">{elevator.location || "—"}</td>
                    <td className="px-6 py-4 text-gray-700">{elevator.elevator_type || "—"}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {elevator.building_number ? (
                        <div className="flex flex-col">
                          <span>Building: {elevator.building_number}</span>
                          {elevator.address && <span className="text-xs text-gray-500">{elevator.address}, {elevator.city || ""}</span>}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {elevator.management_company ? (
                        <div className="flex flex-col">
                          <span>{elevator.management_company}</span>
                          {elevator.management_contact_person && (
                            <span className="text-xs text-gray-500">Contact: {elevator.management_contact_person}</span>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {elevator.elevator_company ? (
                        <div className="flex flex-col">
                          <span>{elevator.elevator_company}</span>
                          {elevator.elevator_system_type && (
                            <span className="text-xs text-gray-500">System: {elevator.elevator_system_type}</span>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {elevator.secured_floors ? (
                        <div className="flex flex-col">
                          <span>Floors: {elevator.secured_floors}</span>
                          <span className="text-xs text-gray-500">
                            {elevator.reader_type ? `Reader: ${elevator.reader_type}` : ""}
                            {elevator.reader_mounting_surface_ferrous ? " (Ferrous)" : ""}
                          </span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {elevator.freight_car_numbers ? (
                        <div className="flex flex-col">
                          <span>Cars: {elevator.freight_car_numbers}</span>
                          {elevator.freight_car_home_floor && (
                            <span className="text-xs text-gray-500">Home: {elevator.freight_car_home_floor}</span>
                          )}
                          {elevator.shutdown_freight_car && (
                            <span className="text-xs text-red-500">Shutdown Required</span>
                          )}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedElevator(elevator);
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
                              await apiRequest("POST", `/api/elevators/${elevator.id}/duplicate`);
                              
                              // Invalidate and refetch
                              queryClient.invalidateQueries({ 
                                queryKey: [`/api/projects/${project.id}/elevators`]
                              });
                              
                              toast({
                                title: "Elevator Duplicated",
                                description: "The elevator has been duplicated successfully.",
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
                          onClick={() => handleDelete(elevator.id)}
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
        {filteredElevators.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredElevators.length)}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredElevators.length)}</span> of <span className="font-medium">{filteredElevators.length}</span> elevators
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
    </Card>
  );
}

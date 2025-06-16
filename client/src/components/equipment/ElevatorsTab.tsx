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
import { Plus, Search, Edit, Copy, Trash, ArrowUpDown, FileDown } from "lucide-react";
import { ViewModeToggle, type ViewMode } from "@/components/ViewModeToggle";
import * as XLSX from 'xlsx';

interface ElevatorsTabProps {
  project: Project;
}

export default function ElevatorsTab({ project }: ElevatorsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedElevator, setSelectedElevator] = useState<Elevator | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const itemsPerPage = 50;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Function to export elevators to Excel
  const handleExportToTemplate = async () => {
    if (filteredElevators.length === 0) {
      toast({
        title: "Export Failed",
        description: "No elevators available to export.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const wb = XLSX.utils.book_new();
      
      const header = [
        "Device Number", "Elevator Location", "Elevator Type", "Floor Count", 
        "Bank Name", "Building Number", "Management Company", "Management Contact", 
        "Management Phone", "Elevator Company", "Elevator Contact", "Elevator Phone",
        "System Type", "Secured Floors", "Notes"
      ];
      
      const data = [header];
      
      filteredElevators.forEach((elevator, index) => {
        const row = [
          (index + 1).toString(),
          elevator.location || "",
          elevator.elevator_type || "",
          elevator.floor_count?.toString() || "",
          elevator.bank_name || "",
          elevator.building_number || "",
          elevator.management_company || "",
          elevator.management_contact_person || "",
          elevator.management_phone_number || "",
          elevator.elevator_company || "",
          elevator.elevator_contact_person || "",
          elevator.elevator_phone_number || "",
          elevator.elevator_system_type || "",
          elevator.secured_floors || "",
          elevator.notes || ""
        ];
        data.push(row);
      });
      
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.sheet_add_aoa(worksheet, [["Kastle Elevator & Turnstile Information"]], { origin: "A1" });
      
      if (!worksheet['!merges']) worksheet['!merges'] = [];
      worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } });
      
      const title_cell = worksheet.A1;
      if (title_cell) {
        title_cell.s = {
          font: { bold: true, sz: 14 },
          alignment: { horizontal: "center" }
        };
      }
      
      worksheet['!cols'] = [
        { wch: 12 }, { wch: 25 }, { wch: 18 }, { wch: 12 },
        { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 20 },
        { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 18 },
        { wch: 18 }, { wch: 20 }, { wch: 30 }
      ];
      
      XLSX.utils.book_append_sheet(wb, worksheet, "Elevators");
      
      const projectName = project.name || 'Project';
      const filename = `${projectName}_Elevator_Schedule.xlsx`;
      XLSX.writeFile(wb, filename);
      
      toast({
        title: "Export Successful",
        description: `Elevator schedule exported as ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export elevator schedule.",
        variant: "destructive"
      });
    }
  };

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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Elevators & Turnstiles</h2>
          <p className="text-gray-600 mt-1">
            Manage elevator and turnstile equipment for this project ({filteredElevators.length} total)
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search elevators..."
              className="pl-9 pr-4 py-2 h-10 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          </div>
          
          <div className="flex gap-2">
            <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportToTemplate}
              disabled={filteredElevators.length === 0}
              className="whitespace-nowrap"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Elevator
            </Button>
          </div>
        </div>
      </div>
      {/* Content Section */}
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
                className="mt-4"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Elevator
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedElevators.map((elevator) => (
            <Card key={elevator.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="rounded-full bg-blue-100 p-2 mr-3">
                      <ArrowUpDown className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {elevator.location || "Elevator"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {elevator.elevator_type || "Standard Elevator"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedElevator(elevator);
                        setShowEditModal(true);
                      }}
                      className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(elevator.id)}
                      className="h-8 w-8 text-gray-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {elevator.building_number && (
                    <div>
                      <span className="font-medium text-gray-700">Building:</span>
                      <span className="ml-2 text-gray-600">{elevator.building_number}</span>
                    </div>
                  )}
                  
                  {elevator.floor_count && (
                    <div>
                      <span className="font-medium text-gray-700">Floors:</span>
                      <span className="ml-2 text-gray-600">{elevator.floor_count}</span>
                    </div>
                  )}
                  
                  {elevator.management_company && (
                    <div>
                      <span className="font-medium text-gray-700">Management:</span>
                      <span className="ml-2 text-gray-600">{elevator.management_company}</span>
                    </div>
                  )}
                  
                  {elevator.elevator_company && (
                    <div>
                      <span className="font-medium text-gray-700">Elevator Co:</span>
                      <span className="ml-2 text-gray-600">{elevator.elevator_company}</span>
                    </div>
                  )}
                  
                  {elevator.notes && (
                    <div>
                      <span className="font-medium text-gray-700">Notes:</span>
                      <p className="ml-2 text-gray-600 text-xs mt-1">{elevator.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        
      {/* Pagination */}
      {filteredElevators.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
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

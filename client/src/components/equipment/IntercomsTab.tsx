import { useState } from "react";
import { Intercom, Project } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddIntercomModal from "../modals/AddIntercomModal";
import EditIntercomModal from "../modals/EditIntercomModal";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Copy, Trash, Phone, FileDown } from "lucide-react";
import { ViewModeToggle, type ViewMode } from "@/components/ViewModeToggle";
import * as XLSX from 'xlsx';

interface IntercomsTabProps {
  project: Project;
}

export default function IntercomsTab({ project }: IntercomsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editingIntercom, setEditingIntercom] = useState<Intercom | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const itemsPerPage = 50;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Function to export intercoms to Excel
  const handleExportToTemplate = async () => {
    if (filteredIntercoms.length === 0) {
      toast({
        title: "Export Failed",
        description: "No intercoms available to export.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const wb = XLSX.utils.book_new();
      
      const header = [
        "Device Number", "Intercom Location", "Intercom Type", "Audio Type", 
        "Video Capability", "Installation Notes", "Network Requirements", 
        "Power Requirements", "Additional Features", "Notes"
      ];
      
      const data = [header];
      
      filteredIntercoms.forEach((intercom: any, index: number) => {
        const row = [
          (index + 1).toString(),
          intercom.location || "",
          intercom.intercom_type || "",
          intercom.audio_type || "",
          intercom.video_capability ? "Yes" : "No",
          intercom.installation_notes || "",
          intercom.network_requirements || "",
          intercom.power_requirements || "",
          intercom.additional_features || "",
          intercom.notes || ""
        ];
        data.push(row);
      });
      
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.sheet_add_aoa(worksheet, [["Kastle Intercom Information"]], { origin: "A1" });
      
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
        { wch: 12 }, { wch: 25 }, { wch: 18 }, { wch: 15 },
        { wch: 15 }, { wch: 25 }, { wch: 20 }, { wch: 20 },
        { wch: 20 }, { wch: 30 }
      ];
      
      XLSX.utils.book_append_sheet(wb, worksheet, "Intercoms");
      
      const projectName = project.name || 'Project';
      const filename = `${projectName}_Intercom_Schedule.xlsx`;
      XLSX.writeFile(wb, filename);
      
      toast({
        title: "Export Successful",
        description: `Intercom schedule exported as ${filename}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export intercom schedule.",
        variant: "destructive"
      });
    }
  };

  // Fetch intercoms
  const { data: intercoms = [], isLoading } = useQuery<any[]>({
    queryKey: [`/api/projects/${project.id}/intercoms`],
    enabled: !!project.id,
  });

  // Filter intercoms based on search term
  const filteredIntercoms = intercoms.filter((ic: any) => 
    (ic.location?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (ic.intercom_type?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Intercoms</h2>
          <p className="text-gray-600 mt-1">
            Manage intercom systems for this project ({filteredIntercoms.length} total)
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search intercoms..."
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
              disabled={filteredIntercoms.length === 0}
              className="whitespace-nowrap"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Intercom
            </Button>
          </div>
        </div>
      </div>
      {/* Content Section */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 border-t-2 border-b-2 border-gray-300 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-500">Loading intercoms...</p>
          </div>
        </div>
      ) : paginatedIntercoms.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full bg-gray-100 p-3 mb-3">
              <Phone className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No intercoms found</p>
            <p className="text-sm text-gray-500 mt-1 max-w-md">
              {searchTerm ? "No intercoms match your search criteria." : "No intercoms have been added to this project yet."}
            </p>
            {!searchTerm && (
              <Button 
                className="mt-4"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add First Intercom
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedIntercoms.map((intercom: any) => (
            <Card key={intercom.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="rounded-full bg-green-100 p-2 mr-3">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {intercom.location || "Intercom"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {intercom.intercom_type || "Standard Intercom"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(intercom)}
                      className="h-8 w-8 text-gray-500 hover:text-gray-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(intercom.id)}
                      className="h-8 w-8 text-gray-500 hover:text-red-700"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  {intercom.notes && (
                    <div>
                      <span className="font-medium text-gray-700">Notes:</span>
                      <p className="ml-2 text-gray-600 text-xs mt-1">{intercom.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Pagination */}
      {filteredIntercoms.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
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

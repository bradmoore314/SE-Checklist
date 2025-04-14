import { useState } from "react";
import { AccessPoint, Project } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddAccessPointModal from "../modals/AddAccessPointModal";
import EditAccessPointModal from "../modals/EditAccessPointModal";
import ImageGallery from "./ImageGallery";
import { useToast } from "@/hooks/use-toast";
import { Settings, Camera } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface CardAccessTabProps {
  project: Project;
}

export default function CardAccessTab({ project }: CardAccessTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedAccessPoint, setSelectedAccessPoint] = useState<AccessPoint | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState({
    lockProvider: false,
    interiorPerimeter: false,
    exstPanelLocation: false,
    exstPanelType: false,
    exstReaderType: false,
    newPanelLocation: false,
    newPanelType: false,
    newReaderType: false,
    notes: false
  });

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
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                className="mr-2 border-zinc-700 text-white hover:bg-zinc-700"
                size="sm"
              >
                <Settings className="h-4 w-4 mr-1" />
                Column Settings
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-72 p-4" 
              style={{ backgroundColor: 'var(--dark-grey)', borderColor: 'var(--medium-grey)' }}
            >
              <h4 className="text-sm font-semibold mb-3 text-white">Show/Hide Columns</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="lock-provider"
                    checked={visibleColumns.lockProvider}
                    onCheckedChange={(checked) => 
                      setVisibleColumns({...visibleColumns, lockProvider: !!checked})
                    }
                  />
                  <Label htmlFor="lock-provider" className="text-sm text-gray-300">Lock Provider</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="interior-perimeter"
                    checked={visibleColumns.interiorPerimeter}
                    onCheckedChange={(checked) => 
                      setVisibleColumns({...visibleColumns, interiorPerimeter: !!checked})
                    }
                  />
                  <Label htmlFor="interior-perimeter" className="text-sm text-gray-300">Interior/Perimeter</Label>
                </div>
                
                <div className="pt-2 border-t border-zinc-700">
                  <h5 className="text-xs font-medium mb-2 text-white">Panel Information</h5>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="exst-panel-location"
                    checked={visibleColumns.exstPanelLocation}
                    onCheckedChange={(checked) => 
                      setVisibleColumns({...visibleColumns, exstPanelLocation: !!checked})
                    }
                  />
                  <Label htmlFor="exst-panel-location" className="text-sm text-gray-300">Existing Panel Location</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="exst-panel-type"
                    checked={visibleColumns.exstPanelType}
                    onCheckedChange={(checked) => 
                      setVisibleColumns({...visibleColumns, exstPanelType: !!checked})
                    }
                  />
                  <Label htmlFor="exst-panel-type" className="text-sm text-gray-300">Existing Panel Type</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="exst-reader-type"
                    checked={visibleColumns.exstReaderType}
                    onCheckedChange={(checked) => 
                      setVisibleColumns({...visibleColumns, exstReaderType: !!checked})
                    }
                  />
                  <Label htmlFor="exst-reader-type" className="text-sm text-gray-300">Existing Reader Type</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="new-panel-location"
                    checked={visibleColumns.newPanelLocation}
                    onCheckedChange={(checked) => 
                      setVisibleColumns({...visibleColumns, newPanelLocation: !!checked})
                    }
                  />
                  <Label htmlFor="new-panel-location" className="text-sm text-gray-300">New Panel Location</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="new-panel-type"
                    checked={visibleColumns.newPanelType}
                    onCheckedChange={(checked) => 
                      setVisibleColumns({...visibleColumns, newPanelType: !!checked})
                    }
                  />
                  <Label htmlFor="new-panel-type" className="text-sm text-gray-300">New Panel Type</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="new-reader-type"
                    checked={visibleColumns.newReaderType}
                    onCheckedChange={(checked) => 
                      setVisibleColumns({...visibleColumns, newReaderType: !!checked})
                    }
                  />
                  <Label htmlFor="new-reader-type" className="text-sm text-gray-300">New Reader Type</Label>
                </div>
                
                <div className="pt-2 border-t border-zinc-700">
                  <h5 className="text-xs font-medium mb-2 text-white">Other</h5>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="notes"
                    checked={visibleColumns.notes}
                    onCheckedChange={(checked) => 
                      setVisibleColumns({...visibleColumns, notes: !!checked})
                    }
                  />
                  <Label htmlFor="notes" className="text-sm text-gray-300">Notes</Label>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
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
            <tr style={{ backgroundColor: 'var(--red-accent)' }}>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">LOCATION</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">QUICK CONFIG</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">READER TYPE</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">LOCK TYPE</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">MONITORING</th>
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">TAKEOVER</th>
              {visibleColumns.lockProvider && (
                <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">LOCK PROVIDER</th>
              )}
              {visibleColumns.interiorPerimeter && (
                <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">INTERIOR/PERIMETER</th>
              )}
              {visibleColumns.exstPanelLocation && (
                <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">EXISTING PANEL LOCATION</th>
              )}
              {visibleColumns.exstPanelType && (
                <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">EXISTING PANEL TYPE</th>
              )}
              {visibleColumns.exstReaderType && (
                <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">EXISTING READER TYPE</th>
              )}
              {visibleColumns.newPanelLocation && (
                <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">NEW PANEL LOCATION</th>
              )}
              {visibleColumns.newPanelType && (
                <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">NEW PANEL TYPE</th>
              )}
              {visibleColumns.newReaderType && (
                <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">NEW READER TYPE</th>
              )}
              {visibleColumns.notes && (
                <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">NOTES</th>
              )}
              <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr style={{ backgroundColor: 'var(--lightest-grey)' }}>
                <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 7} className="px-4 py-8 text-center text-gray-800">Loading access points...</td>
              </tr>
            ) : paginatedAccessPoints.length === 0 ? (
              <tr style={{ backgroundColor: 'var(--lightest-grey)' }}>
                <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 7} className="px-4 py-8 text-center text-gray-800">
                  {searchTerm ? "No access points match your search." : "No access points have been added yet."}
                </td>
              </tr>
            ) : (
              paginatedAccessPoints.map((ap: AccessPoint) => (
                <tr key={ap.id} className="border-b" 
                    style={{ backgroundColor: 'var(--lightest-grey)', borderColor: 'var(--medium-grey)' }}
                >
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">{ap.location}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.quick_config}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.reader_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.lock_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.monitoring_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.takeover || 'No'}</td>
                  {visibleColumns.lockProvider && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.lock_provider || 'N/A'}</td>
                  )}
                  {visibleColumns.interiorPerimeter && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.interior_perimeter || 'N/A'}</td>
                  )}
                  {visibleColumns.exstPanelLocation && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.exst_panel_location || 'N/A'}</td>
                  )}
                  {visibleColumns.exstPanelType && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.exst_panel_type || 'N/A'}</td>
                  )}
                  {visibleColumns.exstReaderType && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.exst_reader_type || 'N/A'}</td>
                  )}
                  {visibleColumns.newPanelLocation && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.new_panel_location || 'N/A'}</td>
                  )}
                  {visibleColumns.newPanelType && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.new_panel_type || 'N/A'}</td>
                  )}
                  {visibleColumns.newReaderType && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.new_reader_type || 'N/A'}</td>
                  )}
                  {visibleColumns.notes && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.notes || 'N/A'}</td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button 
                      className="text-gray-700 hover:text-gray-900 focus:outline-none mr-2"
                      onClick={() => {
                        setSelectedAccessPoint(ap);
                        setShowEditModal(true);
                      }}
                    >
                      <span className="material-icons text-sm">edit</span>
                    </button>
                    <button 
                      className="text-gray-700 hover:text-gray-900 focus:outline-none mr-2"
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
                      className="text-gray-700 hover:text-gray-900 focus:outline-none mr-2"
                      onClick={() => {
                        setSelectedAccessPoint(ap);
                        setShowImageModal(true);
                      }}
                    >
                      <Camera className="h-4 w-4" />
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
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-800">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredAccessPoints.length)}</span> to <span className="font-medium text-gray-800">{Math.min(currentPage * itemsPerPage, filteredAccessPoints.length)}</span> of <span className="font-medium text-gray-800">{filteredAccessPoints.length}</span> access points
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
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
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              }
              return null;
            })}
            
            <Button 
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
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

      {/* Image Gallery Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Images for {selectedAccessPoint?.location || 'Access Point'}</DialogTitle>
            <DialogDescription>Upload and manage images for this access point.</DialogDescription>
          </DialogHeader>
          {selectedAccessPoint && showImageModal && (
            <ImageGallery 
              equipmentType="access_point" 
              equipmentId={selectedAccessPoint.id} 
              projectId={project.id} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

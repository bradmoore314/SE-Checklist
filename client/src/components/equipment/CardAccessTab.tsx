import { useState } from "react";
import { AccessPoint, Project } from "@shared/schema";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddAccessPointModal from "../modals/AddAccessPointModal";
import EditAccessPointModal from "../modals/EditAccessPointModal";
import ImageGallery from "./ImageGallery";
import { useToast } from "@/hooks/use-toast";
import { Settings, ChevronDown, ChevronUp, Trash, Image as ImageIcon, DoorOpen, Edit } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ViewModeToggle, type ViewMode } from "@/components/ViewModeToggle";
import { ExpandableEquipmentCard } from "@/components/ExpandableEquipmentCard";
import { useAutoSave } from "@/hooks/useAutoSave";

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
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
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

  // Auto-save mutation
  const updateAccessPointMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest('PUT', `/api/access-points/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/access-points`] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${project.id}/reports/project-summary`] });
    },
    onError: (error: Error) => {
      toast({
        title: "Auto-save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Fetch access points
  const { data: accessPoints = [], isLoading } = useQuery<AccessPoint[]>({
    queryKey: [`/api/projects/${project.id}/access-points`],
    enabled: !!project.id,
  });
  
  // Fetch lookup data for dropdown options
  const { data: lookupData } = useQuery({
    queryKey: ["/api/lookup"],
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
        <h3 className="text-lg font-medium bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent">Card Access Points</h3>
        <div className="flex items-center gap-2">
          <ViewModeToggle viewMode={viewMode} onChange={setViewMode} />
          
          {viewMode === 'table' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  size="sm"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Columns
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-72 p-4 bg-white border-gray-200"
              >
                <h4 className="text-sm font-semibold mb-3 text-gray-900">Show/Hide Columns</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="lock-provider"
                      checked={visibleColumns.lockProvider}
                      onCheckedChange={(checked) => 
                        setVisibleColumns({...visibleColumns, lockProvider: !!checked})
                      }
                    />
                    <Label htmlFor="lock-provider" className="text-sm text-gray-700">Lock Provider</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="interior-perimeter"
                      checked={visibleColumns.interiorPerimeter}
                      onCheckedChange={(checked) => 
                        setVisibleColumns({...visibleColumns, interiorPerimeter: !!checked})
                      }
                    />
                    <Label htmlFor="interior-perimeter" className="text-sm text-gray-700">Interior/Perimeter</Label>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <h5 className="text-xs font-medium mb-2 text-gray-700">Panel Information</h5>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="exst-panel-location"
                      checked={visibleColumns.exstPanelLocation}
                      onCheckedChange={(checked) => 
                        setVisibleColumns({...visibleColumns, exstPanelLocation: !!checked})
                      }
                    />
                    <Label htmlFor="exst-panel-location" className="text-sm text-gray-700">Existing Panel Location</Label>
                  </div>
                  {/* Add other checkboxes for columns */}
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          <Button
            variant="outline"
            className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            <span className="material-icons mr-1" style={{ fontSize: '16px' }}>add</span>
            Add
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search access points by location, config, or reader type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredAccessPoints.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500 mb-4">No access points found for this project.</p>
          <Button 
            className="mt-4 px-4 py-2 rounded-md flex items-center mx-auto bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white"
            onClick={() => setShowAddModal(true)}
          >
            <span className="material-icons mr-1">add</span>
            Add Access Point
          </Button>
        </div>
      ) : viewMode === 'cards' ? (
        // Card View
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {paginatedAccessPoints.map((ap: AccessPoint, index: number) => (
            <ExpandableEquipmentCard
              key={ap.id}
              title="Access Point"
              subtitle={ap.location}
              number={index + 1}
              onEdit={() => {
                setSelectedAccessPoint(ap);
                setShowEditModal(true);
              }}
              onDelete={() => handleDelete(ap.id)}
              headerContent={
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Lock Type</p>
                    <div className="flex items-center">
                      <p className="text-sm font-medium hover:underline cursor-pointer"
                         onClick={() => {
                           setSelectedAccessPoint(ap);
                           setShowEditModal(true);
                         }}
                      >
                        {ap.lock_type || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Monitoring Type</p>
                    <div className="flex items-center">
                      <p className="text-sm font-medium hover:underline cursor-pointer"
                         onClick={() => {
                           setSelectedAccessPoint(ap);
                           setShowEditModal(true);
                         }}
                      >
                        {ap.monitoring_type || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Lock Provider</p>
                    <div className="flex items-center">
                      <p className="text-sm font-medium hover:underline cursor-pointer"
                         onClick={() => {
                           setSelectedAccessPoint(ap);
                           setShowEditModal(true);
                         }}
                      >
                        {ap.lock_provider || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Interior/Perimeter</p>
                    <div className="flex items-center">
                      <p className="text-sm font-medium hover:underline cursor-pointer"
                         onClick={() => {
                           setSelectedAccessPoint(ap);
                           setShowEditModal(true);
                         }}
                      >
                        {ap.interior_perimeter || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Takeover</p>
                    <div className="flex items-center">
                      <p className="text-sm font-medium hover:underline cursor-pointer"
                         onClick={() => {
                           setSelectedAccessPoint(ap);
                           setShowEditModal(true);
                         }}
                      >
                        {ap.takeover || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              }
            >
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground text-xs">Lock Provider</p>
                      <div className="flex items-center">
                        <p className="text-sm hover:underline cursor-pointer"
                           onClick={() => {
                             setSelectedAccessPoint(ap);
                             setShowEditModal(true);
                           }}
                        >
                          {ap.lock_provider || "Not specified"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Interior/Perimeter</p>
                      <div className="flex items-center">
                        <p className="text-sm hover:underline cursor-pointer"
                           onClick={() => {
                             setSelectedAccessPoint(ap);
                             setShowEditModal(true);
                           }}
                        >
                          {ap.interior_perimeter || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Panel Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground text-xs">Existing Panel Location</p>
                      <div className="flex items-center">
                        <p className="text-sm hover:underline cursor-pointer"
                           onClick={() => {
                             setSelectedAccessPoint(ap);
                             setShowEditModal(true);
                           }}
                        >
                          {ap.exst_panel_location || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Existing Panel Type</p>
                      <div className="flex items-center">
                        <p className="text-sm hover:underline cursor-pointer"
                           onClick={() => {
                             setSelectedAccessPoint(ap);
                             setShowEditModal(true);
                           }}
                        >
                          {ap.exst_panel_type || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Existing Reader Type</p>
                      <div className="flex items-center">
                        <p className="text-sm hover:underline cursor-pointer"
                           onClick={() => {
                             setSelectedAccessPoint(ap);
                             setShowEditModal(true);
                           }}
                        >
                          {ap.exst_reader_type || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">New Panel Location</p>
                      <div className="flex items-center">
                        <p className="text-sm hover:underline cursor-pointer"
                           onClick={() => {
                             setSelectedAccessPoint(ap);
                             setShowEditModal(true);
                           }}
                        >
                          {ap.new_panel_location || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">New Panel Type</p>
                      <div className="flex items-center">
                        <p className="text-sm hover:underline cursor-pointer"
                           onClick={() => {
                             setSelectedAccessPoint(ap);
                             setShowEditModal(true);
                           }}
                        >
                          {ap.new_panel_type || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">New Reader Type</p>
                      <div className="flex items-center">
                        <p className="text-sm hover:underline cursor-pointer"
                           onClick={() => {
                             setSelectedAccessPoint(ap);
                             setShowEditModal(true);
                           }}
                        >
                          {ap.new_reader_type || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {ap.notes && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 hover:underline cursor-pointer"
                       onClick={() => {
                         setSelectedAccessPoint(ap);
                         setShowEditModal(true);
                       }}
                    >
                      Notes
                    </h4>
                    <p className="text-sm bg-muted/30 p-2 rounded border hover:bg-muted cursor-pointer"
                       onClick={() => {
                         setSelectedAccessPoint(ap);
                         setShowEditModal(true);
                       }}
                    >
                      {ap.notes}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedAccessPoint(ap);
                      setShowImageModal(true);
                    }}
                    className="flex items-center"
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    View Images
                  </Button>
                </div>
              </div>
            </ExpandableEquipmentCard>
          ))}
        </div>
      ) : (
        // Table View
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gradient-to-r from-red-500 to-rose-600">
                <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">LOCATION</th>
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
                <th scope="col" className="px-4 py-3 whitespace-nowrap text-xs uppercase text-white">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedAccessPoints.map((ap: AccessPoint, idx: number) => (
                <tr key={ap.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className="text-blue-600">{ap.location || "—"}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 ml-1" 
                        onClick={() => {
                          setSelectedAccessPoint(ap);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span>{ap.reader_type || "—"}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 ml-1" 
                        onClick={() => {
                          setSelectedAccessPoint(ap);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span>{ap.lock_type || "—"}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 ml-1" 
                        onClick={() => {
                          setSelectedAccessPoint(ap);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span>{ap.monitoring_type || "—"}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 ml-1" 
                        onClick={() => {
                          setSelectedAccessPoint(ap);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span>{ap.takeover || "No"}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0 ml-1" 
                        onClick={() => {
                          setSelectedAccessPoint(ap);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                  {visibleColumns.lockProvider && (
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span>{ap.lock_provider || "—"}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 ml-1" 
                          onClick={() => {
                            setSelectedAccessPoint(ap);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  )}
                  {visibleColumns.interiorPerimeter && (
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span>{ap.interior_perimeter || "—"}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 ml-1" 
                          onClick={() => {
                            setSelectedAccessPoint(ap);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedAccessPoint(ap);
                          setShowEditModal(true);
                        }}
                        className="p-0 h-7 w-7 text-indigo-600"
                        title="Edit Access Point"
                      >
                        <span className="material-icons" style={{ fontSize: '14px' }}>edit</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(ap.id)}
                        className="p-0 h-7 w-7 text-red-600"
                        title="Delete Access Point"
                      >
                        <Trash size={14} />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedAccessPoint(ap);
                          setShowImageModal(true);
                        }}
                        className="p-0 h-7 w-7 text-blue-600"
                        title="Image Gallery"
                      >
                        <ImageIcon size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
      {filteredAccessPoints.length > itemsPerPage && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Showing {Math.min(currentPage * itemsPerPage, filteredAccessPoints.length)} of {filteredAccessPoints.length} access points
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage <= 1}
              className="h-8 px-3"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="h-8 px-3"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddAccessPointModal
          projectId={project.id}
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAddSave}
        />
      )}

      {showEditModal && selectedAccessPoint && (
        <EditAccessPointModal
          isOpen={showEditModal}
          accessPoint={selectedAccessPoint}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAccessPoint(null);
          }}
          onSave={handleEditSave}
        />
      )}

      {showImageModal && selectedAccessPoint && (
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Images for Access Point {selectedAccessPoint.id}</DialogTitle>
              <DialogDescription>
                View and manage images for this access point
              </DialogDescription>
            </DialogHeader>
            
            <ImageGallery
              equipmentId={selectedAccessPoint.id}
              equipmentType="access_point"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import { AccessPoint, Project } from "@shared/schema";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AddAccessPointModal from "../modals/AddAccessPointModal";
import EditAccessPointModal from "../modals/EditAccessPointModal";
import ImageGallery from "./ImageGallery";
import { useToast } from "@/hooks/use-toast";
import { Settings, Camera, ChevronDown, ChevronUp, Copy, Trash, Image as ImageIcon, Layers, DoorOpen } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="exst-panel-type"
                      checked={visibleColumns.exstPanelType}
                      onCheckedChange={(checked) => 
                        setVisibleColumns({...visibleColumns, exstPanelType: !!checked})
                      }
                    />
                    <Label htmlFor="exst-panel-type" className="text-sm text-gray-700">Existing Panel Type</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="exst-reader-type"
                      checked={visibleColumns.exstReaderType}
                      onCheckedChange={(checked) => 
                        setVisibleColumns({...visibleColumns, exstReaderType: !!checked})
                      }
                    />
                    <Label htmlFor="exst-reader-type" className="text-sm text-gray-700">Existing Reader Type</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="new-panel-location"
                      checked={visibleColumns.newPanelLocation}
                      onCheckedChange={(checked) => 
                        setVisibleColumns({...visibleColumns, newPanelLocation: !!checked})
                      }
                    />
                    <Label htmlFor="new-panel-location" className="text-sm text-gray-700">New Panel Location</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="new-panel-type"
                      checked={visibleColumns.newPanelType}
                      onCheckedChange={(checked) => 
                        setVisibleColumns({...visibleColumns, newPanelType: !!checked})
                      }
                    />
                    <Label htmlFor="new-panel-type" className="text-sm text-gray-700">New Panel Type</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="new-reader-type"
                      checked={visibleColumns.newReaderType}
                      onCheckedChange={(checked) => 
                        setVisibleColumns({...visibleColumns, newReaderType: !!checked})
                      }
                    />
                    <Label htmlFor="new-reader-type" className="text-sm text-gray-700">New Reader Type</Label>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100">
                    <h5 className="text-xs font-medium mb-2 text-gray-700">Other</h5>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="notes"
                      checked={visibleColumns.notes}
                      onCheckedChange={(checked) => 
                        setVisibleColumns({...visibleColumns, notes: !!checked})
                      }
                    />
                    <Label htmlFor="notes" className="text-sm text-gray-700">Notes</Label>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          <div className="relative">
            <div className="relative">
              <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
              <Input
                type="text"
                placeholder="Search access points"
                className="pl-10 pr-4 py-2 w-64 border-gray-200"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
          </div>
          
          {filteredAccessPoints.length > 0 && (
            <div className="text-sm text-gray-500">
              {filteredAccessPoints.length} {filteredAccessPoints.length === 1 ? 'access point' : 'access points'}
            </div>
          )}
          
          <Button 
            className="px-4 py-2 rounded-md flex items-center bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white"
            onClick={() => setShowAddModal(true)}
          >
            <span className="material-icons mr-1">add</span>
            Add Access Point
          </Button>
        </div>
      </div>
      
      {/* Access Points Content */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : paginatedAccessPoints.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <DoorOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No access points found</h3>
          <p className="mt-2 text-gray-500">
            {searchTerm 
              ? "No access points match your search criteria. Try adjusting your search."
              : "Get started by adding your first access point."}
          </p>
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
          {paginatedAccessPoints.map((ap: AccessPoint) => (
            <Card key={ap.id} className="overflow-hidden border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-red-50 to-rose-100 border-b pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg text-red-800 flex items-center gap-2">
                    <span className="p-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm">
                      {ap.id}
                    </span>
                    Access Point
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedAccessPoint(ap);
                        setShowImageModal(true);
                      }}
                      className="text-blue-500 p-0 h-7 w-7 hover:bg-blue-50 hover:text-blue-600"
                      title="Image Gallery"
                    >
                      <ImageIcon size={14} />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedAccessPoint(ap);
                        setShowEditModal(true);
                      }}
                      className="text-indigo-500 p-0 h-7 w-7 hover:bg-indigo-50 hover:text-indigo-600"
                      title="Edit Access Point"
                    >
                      <span className="material-icons" style={{ fontSize: '14px' }}>edit</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(ap.id)}
                      className="text-red-500 p-0 h-7 w-7 hover:bg-red-50 hover:text-red-600"
                      title="Delete Access Point"
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                </div>
                <div className="text-sm text-red-700 font-medium mt-1 flex items-center gap-1">
                  <DoorOpen size={14} className="text-red-600" /> 
                  {ap.location ? 
                    (ap.location.length > 40 ? 
                      `${ap.location.substring(0, 40)}...` : 
                      ap.location) : 
                    "Location not specified"}
                </div>
              </CardHeader>
              
              <CardContent className="pt-4 pb-3 px-4">
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 font-medium">Quick Config</p>
                      <p className="text-gray-900">{ap.quick_config || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Reader Type</p>
                      <p className="text-gray-900">{ap.reader_type || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Lock Type</p>
                      <p className="text-gray-900">{ap.lock_type || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Monitoring</p>
                      <p className="text-gray-900">{ap.monitoring_type || "Not specified"}</p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100 mt-3">
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto text-blue-600 hover:text-blue-800 hover:bg-transparent flex items-center gap-1"
                      onClick={() => setExpandedCards(prev => ({ ...prev, [ap.id]: !prev[ap.id] }))}
                    >
                      {expandedCards[ap.id] ? (
                        <>
                          <ChevronUp size={16} />
                          <span>Show less</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown size={16} />
                          <span>Show more</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {expandedCards[ap.id] && (
                    <div className="pt-2 space-y-4 border-t border-gray-100 mt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-500 font-medium">Takeover</p>
                          <p className="text-gray-900">{ap.takeover || "No"}</p>
                        </div>
                        {ap.lock_provider && (
                          <div>
                            <p className="text-gray-500 font-medium">Lock Provider</p>
                            <p className="text-gray-900">{ap.lock_provider}</p>
                          </div>
                        )}
                        {ap.interior_perimeter && (
                          <div>
                            <p className="text-gray-500 font-medium">Interior/Perimeter</p>
                            <p className="text-gray-900">{ap.interior_perimeter}</p>
                          </div>
                        )}
                      </div>
                      
                      {(ap.exst_panel_location || ap.exst_panel_type || ap.exst_reader_type) && (
                        <div>
                          <p className="text-gray-600 font-medium text-xs uppercase mb-2">Existing Equipment</p>
                          <div className="grid grid-cols-2 gap-4">
                            {ap.exst_panel_location && (
                              <div>
                                <p className="text-gray-500 font-medium">Panel Location</p>
                                <p className="text-gray-900">{ap.exst_panel_location}</p>
                              </div>
                            )}
                            {ap.exst_panel_type && (
                              <div>
                                <p className="text-gray-500 font-medium">Panel Type</p>
                                <p className="text-gray-900">{ap.exst_panel_type}</p>
                              </div>
                            )}
                            {ap.exst_reader_type && (
                              <div>
                                <p className="text-gray-500 font-medium">Reader Type</p>
                                <p className="text-gray-900">{ap.exst_reader_type}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {(ap.new_panel_location || ap.new_panel_type || ap.new_reader_type) && (
                        <div>
                          <p className="text-gray-600 font-medium text-xs uppercase mb-2">New Equipment</p>
                          <div className="grid grid-cols-2 gap-4">
                            {ap.new_panel_location && (
                              <div>
                                <p className="text-gray-500 font-medium">Panel Location</p>
                                <p className="text-gray-900">{ap.new_panel_location}</p>
                              </div>
                            )}
                            {ap.new_panel_type && (
                              <div>
                                <p className="text-gray-500 font-medium">Panel Type</p>
                                <p className="text-gray-900">{ap.new_panel_type}</p>
                              </div>
                            )}
                            {ap.new_reader_type && (
                              <div>
                                <p className="text-gray-500 font-medium">Reader Type</p>
                                <p className="text-gray-900">{ap.new_reader_type}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {ap.notes && (
                        <div>
                          <p className="text-gray-500 font-medium">Notes</p>
                          <p className="text-gray-900 whitespace-pre-wrap">{ap.notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Table View - improved styling
        <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gradient-to-r from-red-500 to-rose-600">
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
              {paginatedAccessPoints.map((ap: AccessPoint, idx: number) => (
                <tr key={ap.id} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-800">{ap.location}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.quick_config}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.reader_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.lock_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.monitoring_type}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.takeover || 'No'}</td>
                  {visibleColumns.lockProvider && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.lock_provider || '-'}</td>
                  )}
                  {visibleColumns.interiorPerimeter && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.interior_perimeter || '-'}</td>
                  )}
                  {visibleColumns.exstPanelLocation && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.exst_panel_location || '-'}</td>
                  )}
                  {visibleColumns.exstPanelType && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.exst_panel_type || '-'}</td>
                  )}
                  {visibleColumns.exstReaderType && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.exst_reader_type || '-'}</td>
                  )}
                  {visibleColumns.newPanelLocation && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.new_panel_location || '-'}</td>
                  )}
                  {visibleColumns.newPanelType && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.new_panel_type || '-'}</td>
                  )}
                  {visibleColumns.newReaderType && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{ap.new_reader_type || '-'}</td>
                  )}
                  {visibleColumns.notes && (
                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">
                      {ap.notes?.length > 20 ? `${ap.notes.substring(0, 20)}...` : ap.notes || '-'}
                    </td>
                  )}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedAccessPoint(ap);
                          setShowEditModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <span className="material-icons text-xl">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(ap.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <span className="material-icons text-xl">delete</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAccessPoint(ap);
                          setShowImageModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Image Gallery"
                      >
                        <ImageIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Pagination */}
      {filteredAccessPoints.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-800">{Math.min((currentPage - 1) * itemsPerPage + 1, filteredAccessPoints.length)}</span> to <span className="font-medium text-gray-800">{Math.min(currentPage * itemsPerPage, filteredAccessPoints.length)}</span> of <span className="font-medium text-gray-800">{filteredAccessPoints.length}</span> access points
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              variant="outline"
              size="sm"
              className="border-gray-200 text-gray-600"
            >
              <span className="material-icons text-base">chevron_left</span>
            </Button>
            <div className="text-sm text-gray-600">
              Page <span className="font-medium text-gray-800">{currentPage}</span> of <span className="font-medium text-gray-800">{totalPages || 1}</span>
            </div>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              variant="outline"
              size="sm"
              className="border-gray-200 text-gray-600"
            >
              <span className="material-icons text-base">chevron_right</span>
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
          accessPoint={selectedAccessPoint}
          open={showEditModal}
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
              <DialogTitle>Image Gallery - {selectedAccessPoint.location}</DialogTitle>
              <DialogDescription>
                Manage images for this access point
              </DialogDescription>
            </DialogHeader>
            <div className="mt-2">
              <ImageGallery 
                equipmentId={selectedAccessPoint.id} 
                equipmentType="access_point"
                onClose={() => {
                  setShowImageModal(false);
                  setSelectedAccessPoint(null);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
import { useState } from "react";
import { AccessPoint, Project } from "@shared/schema";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddAccessPointModal from "../modals/AddAccessPointModal";
import EditAccessPointModal from "../modals/EditAccessPointModal";
import UnifiedImageHandler from "../UnifiedImageHandler";
import { useToast } from "@/hooks/use-toast";
import { Settings, ChevronDown, ChevronUp, Trash, Image as ImageIcon, DoorOpen, Edit, Copy, FileDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ViewModeToggle, type ViewMode } from "@/components/ViewModeToggle";
import { ExpandableEquipmentCard } from "@/components/ExpandableEquipmentCard";
import { useAutoSave } from "@/hooks/useAutoSave";
import * as XLSX from 'xlsx';

interface CardAccessTabProps {
  project: Project;
}

export default function CardAccessTab({ project }: CardAccessTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedAccessPoint, setSelectedAccessPoint] = useState<AccessPoint | null>(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [expandedCards, setExpandedCards] = useState<Record<number, boolean>>({});
  const itemsPerPage = 50;
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
  
  // Fetch equipment images (for thumbnails)
  const { data: equipmentImages = {} } = useQuery<Record<number, { image_data: string, thumbnail_data: string }>>({
    queryKey: [`/api/projects/${project.id}/equipment-thumbnails`, 'access_point', currentPage, searchTerm],
    queryFn: async () => {
      if (!paginatedAccessPoints.length) return {};
      
      // Create a map of equipment ID to its first image thumbnail
      const imageMap: Record<number, { image_data: string, thumbnail_data: string }> = {};
      
      // We'll only fetch for the visible/paginated items to avoid excessive requests
      for (const ap of paginatedAccessPoints) {
        try {
          const res = await apiRequest('GET', `/api/images/access_point/${ap.id}`);
          const images = await res.json();
          
          if (images && images.length > 0) {
            // Use thumbnail_data if available, otherwise use full image_data
            imageMap[ap.id] = { 
              image_data: images[0].image_data,
              thumbnail_data: images[0].thumbnail_data || images[0].image_data 
            };
          }
        } catch (error) {
          console.error(`Failed to fetch images for access point ${ap.id}:`, error);
        }
      }
      
      return imageMap;
    },
    enabled: !!project.id && paginatedAccessPoints.length > 0,
  });
  
  // Fetch lookup data for dropdown options
  const { data: lookupData } = useQuery({
    queryKey: ["/api/lookup"],
  });

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
  
  // Export access points to Excel template
  const handleExportToTemplate = async () => {
    if (!accessPoints.length) {
      toast({
        title: "Export Failed",
        description: "No access points available to export.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create a new workbook for the template format requested
      const wb = XLSX.utils.book_new();
      
      // Create a new worksheet with template header
      // Header row matches exactly the template requested
      const header = [
        "Door Number", "Door Name", "Floor", "Door Type", "Install Type", "Reader", "Card Reader", "Lock Type", 
        "Door Contact", "REX", "Push To Exit", "Intercom-Buzzer in", "Door Detail", "HUB Location", "Module Location", 
        "Associated Camera", "Notes"
      ];
      
      const data = [header];
      
      // Add data rows for each access point
      accessPoints.forEach((ap, index) => {
        // Initialize all cells as empty to match template format with empty checkboxes
        const row = Array(17).fill(""); // 17 columns
        
        // Fill in the data we have
        row[0] = (index + 1).toString(); // Door Number (sequential)
        row[1] = ap.location || ""; // Door Name
        row[2] = "1"; // Floor (default to 1)
        row[3] = ap.lock_type || ""; // Door Type
        row[4] = ap.takeover === 'Yes' ? 'Takeover' : 'New Install'; // Install Type
        row[5] = mapReaderType(ap.reader_type); // Reader
        // Card Reader - column 6 - leave empty for checkbox
        row[7] = mapLockType(ap.lock_type); // Lock Type
        // Checkboxes for Door Contact, REX, Push To Exit, Intercom - columns 8-11 - leave empty
        // Door Detail, HUB Location, Module Location - columns 12-14 - leave empty
        row[15] = ""; // Associated Camera
        row[16] = ap.notes || ""; // Notes
        
        data.push(row);
      });
      
      // Create worksheet with exact template layout
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      
      // Add title row above the header
      XLSX.utils.sheet_add_aoa(worksheet, [["Kastle Security Door Information"]], { origin: "A1" });
      
      // Merge cells for title
      if (!worksheet['!merges']) worksheet['!merges'] = [];
      worksheet['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }); // Merge A1:H1 for title
      
      // Style formatting for heading
      const title_cell = worksheet.A1;
      if (title_cell) {
        title_cell.s = {
          font: { bold: true, sz: 14 },
          alignment: { horizontal: "center" }
        };
      }
      
      // Set column widths to make it look nice
      const cols = [
        { wch: 10 }, // Door Number
        { wch: 25 }, // Door Name
        { wch: 8 },  // Floor
        { wch: 15 }, // Door Type
        { wch: 12 }, // Install Type
        { wch: 15 }, // Reader
        { wch: 15 }, // Card Reader
        { wch: 15 }, // Lock Type
        { wch: 12 }, // Door Contact
        { wch: 8 },  // REX
        { wch: 12 }, // Push To Exit
        { wch: 16 }, // Intercom-Buzzer
        { wch: 12 }, // Door Detail
        { wch: 15 }, // HUB Location
        { wch: 15 }, // Module Location
        { wch: 18 }, // Associated Camera
        { wch: 25 }  // Notes
      ];
      worksheet['!cols'] = cols;
      
      // Add special "Needed for Install" title above the middle sections
      XLSX.utils.sheet_add_aoa(worksheet, [["Needed for Install"]], { origin: "I1" });
      
      // Add to workbook
      XLSX.utils.book_append_sheet(wb, worksheet, "Door Schedule");
      
      // Generate filename
      const filename = `${project.name.replace(/[^a-z0-9]/gi, '_')}_Door_Schedule.xlsx`;
      
      // Write and download the file
      XLSX.writeFile(wb, filename);
      
      toast({
        title: "Export Successful",
        description: `Door schedule exported to ${filename}`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: (error as Error).message || "Failed to export door schedule",
        variant: "destructive"
      });
    }
  };
  
  // Helper mapping functions to convert our terms to Kastle template terms
  function mapMonitoringType(type: string): string {
    switch (type) {
      case 'Monitored': return 'Alarm';
      case 'Request to Exit': return 'Prop';
      case 'None': return '';
      default: return type || '';
    }
  }
  
  function mapReaderType(type: string): string {
    switch (type) {
      case 'Standard HID Reader': return 'KR-100';
      case 'Mullion Reader': return 'KR-100M';
      case 'Keypad': return 'KR-100K';
      default: return type || '';
    }
  }
  
  function mapLockType(type: string): string {
    switch (type) {
      case 'Mag Lock': return 'Single Mag';
      case 'Electric Strike': return 'Single Standard';
      case 'Electric Mortise': return 'Single Mortise';
      default: return type || '';
    }
  }

  // Handle save from Add modal
  const handleAddSave = (id: number, newData: AccessPoint) => {
    console.log("New Access Point added:", id, newData);
    
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
  const handleEditSave = (id: number, updatedData: AccessPoint) => {
    console.log("Access Point updated:", id, updatedData);
    
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
  
  // Handle duplicating an access point
  const handleDuplicate = async (ap: AccessPoint) => {
    try {
      // Create a duplicate with "(Copy)" added to the location name
      const duplicateData = {
        ...ap,
        location: `${ap.location} (Copy)`,
        quick_config: ap.quick_config || 'Standard', // Ensure quick_config is included
        id: undefined // Remove the ID so a new one is generated
      };
      
      const response = await apiRequest(
        "POST", 
        "/api/access-points", 
        {
          ...duplicateData,
          project_id: project.id
        }
      );
      
      const result = await response.json();
      
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
  };

  // Calculate statistics
  const calculateStats = () => {
    if (!accessPoints.length) return {
      total: 0,
      takeover: { yes: 0, no: 0 },
      interior: 0,
      perimeter: 0,
      lockTypes: {},
      monitoringTypes: {},
      lockProviders: {}
    };
    
    const stats = {
      total: accessPoints.length,
      takeover: { yes: 0, no: 0 },
      interior: 0,
      perimeter: 0,
      lockTypes: {} as Record<string, number>,
      monitoringTypes: {} as Record<string, number>,
      lockProviders: {} as Record<string, number>
    };
    
    accessPoints.forEach(ap => {
      // Takeover counts
      if (ap.takeover === 'Yes') stats.takeover.yes++;
      else stats.takeover.no++;
      
      // Interior/Perimeter counts
      if (ap.interior_perimeter === 'Interior') stats.interior++;
      else if (ap.interior_perimeter === 'Perimeter') stats.perimeter++;
      
      // Lock types
      if (ap.lock_type) {
        stats.lockTypes[ap.lock_type] = (stats.lockTypes[ap.lock_type] || 0) + 1;
      }
      
      // Monitoring types
      if (ap.monitoring_type) {
        stats.monitoringTypes[ap.monitoring_type] = (stats.monitoringTypes[ap.monitoring_type] || 0) + 1;
      }
      
      // Lock providers
      if (ap.lock_provider) {
        stats.lockProviders[ap.lock_provider] = (stats.lockProviders[ap.lock_provider] || 0) + 1;
      }
    });
    
    return stats;
  };
  
  const stats = calculateStats();

  return (
    <div className="p-6">
      {/* Statistics Dashboard */}
      <div className="mb-8 bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Project Access Points Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          {/* Total Count */}
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="text-sm text-blue-600 font-medium">Total Doors</div>
            <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
          </div>
          
          {/* Takeover vs New */}
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="text-sm text-green-600 font-medium">Takeover Doors</div>
            <div className="text-2xl font-bold text-green-700">{stats.takeover.yes}</div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="text-sm text-purple-600 font-medium">New Doors</div>
            <div className="text-2xl font-bold text-purple-700">{stats.takeover.no}</div>
          </div>
          
          {/* Interior vs Perimeter */}
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <div className="text-sm text-amber-600 font-medium">Interior Doors</div>
            <div className="text-2xl font-bold text-amber-700">{stats.interior}</div>
          </div>
          
          <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
            <div className="text-sm text-rose-600 font-medium">Perimeter Doors</div>
            <div className="text-2xl font-bold text-rose-700">{stats.perimeter}</div>
          </div>
          
          {/* Unassigned (if any) */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="text-sm text-gray-600 font-medium">Unassigned Location</div>
            <div className="text-2xl font-bold text-gray-700">
              {stats.total - stats.interior - stats.perimeter}
            </div>
          </div>
        </div>
        
        {/* Detailed Breakdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Lock Types */}
          <div className="border border-gray-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Lock Types</h4>
            <div className="space-y-1">
              {Object.entries(stats.lockTypes).map(([type, count]) => (
                <div key={`lock-${type}`} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{type}</span>
                  <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{count}</span>
                </div>
              ))}
              {Object.keys(stats.lockTypes).length === 0 && (
                <div className="text-sm text-gray-500 italic">No data available</div>
              )}
            </div>
          </div>
          
          {/* Monitoring Types */}
          <div className="border border-gray-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Monitoring Types</h4>
            <div className="space-y-1">
              {Object.entries(stats.monitoringTypes).map(([type, count]) => (
                <div key={`monitor-${type}`} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{type}</span>
                  <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded">{count}</span>
                </div>
              ))}
              {Object.keys(stats.monitoringTypes).length === 0 && (
                <div className="text-sm text-gray-500 italic">No data available</div>
              )}
            </div>
          </div>
          
          {/* Lock Providers */}
          <div className="border border-gray-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Lock Providers</h4>
            <div className="space-y-1">
              {Object.entries(stats.lockProviders).map(([provider, count]) => (
                <div key={`provider-${provider}`} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">{provider || "Unspecified"}</span>
                  <span className="text-sm font-medium bg-purple-100 text-purple-800 px-2 py-0.5 rounded">{count}</span>
                </div>
              ))}
              {Object.keys(stats.lockProviders).length === 0 && (
                <div className="text-sm text-gray-500 italic">No data available</div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-700">Card Access Points</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            size="sm"
            onClick={handleExportToTemplate}
            disabled={filteredAccessPoints.length === 0}
          >
            <FileDown className="h-4 w-4 mr-1" />
            Export to Excel
          </Button>
          
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
              onDuplicate={() => handleDuplicate(ap)}
              thumbnailImage={equipmentImages[ap.id]?.thumbnail_data}
              headerContent={
                <div className="mt-2">
                {/* First row: Floor number */}
                <div className="mb-2">
                  <p className="text-xs font-medium text-gray-500">Floor {ap.location.split(' ')[1]}</p>
                </div>
                
                {/* Second row: Key data points in two columns */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Lock Type</p>
                    <p className="text-sm font-medium">{ap.lock_type || "Standard"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Monitoring Type</p>
                    <p className="text-sm font-medium">{ap.monitoring_type || "Prop"}</p>
                  </div>
                </div>
                
                {/* Third row: More data points in two columns */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Lock Provider</p>
                    <p className="text-sm font-medium">{ap.lock_provider || "Kastle"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Interior/Perimeter</p>
                    <p className="text-sm font-medium">{ap.interior_perimeter || "Interior"}</p>
                  </div>
                </div>
                
                {/* Fourth row: Takeover information */}
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">Takeover</p>
                  <p className="text-sm font-medium">{ap.takeover || "Yes"}</p>
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
              <tr className="bg-primary">
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
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDuplicate(ap)}
                        className="p-0 h-7 w-7 text-yellow-600"
                        title="Duplicate Access Point"
                      >
                        <Copy size={14} />
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
            
            <UnifiedImageHandler
              projectId={project.id}
              equipmentId={selectedAccessPoint.id}
              equipmentType="access_point"
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
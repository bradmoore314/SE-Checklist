import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AccessPoint } from "@shared/schema";
import { DataTable, createSortableHeader } from "@/components/ui/data-table";
import { createColumnHelper, createSortableColumn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Edit, Plus, FileCog, Copy, Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddAccessPointModal } from "@/components/modals/AddAccessPointModal";
import { EditAccessPointModal } from "@/components/modals/EditAccessPointModal";
import { ImageGallery } from "@/components/ImageGallery";
import TopNav from "@/components/TopNav";

export default function AccessPointTablePage() {
  const { id: projectId } = useParams();
  const { toast } = useToast();

  // State for modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccessPoint, setSelectedAccessPoint] = useState<AccessPoint | null>(null);
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false);
  const [selectedAccessPointForImages, setSelectedAccessPointForImages] = useState<AccessPoint | null>(null);

  // Fetch access points
  const { 
    data: accessPoints, 
    isLoading, 
    isError 
  } = useQuery<AccessPoint[]>({
    queryKey: ['/api/projects', projectId, 'access-points'],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/access-points/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Access point deleted successfully",
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/projects', projectId, 'access-points'],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete access point: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/access-points/${id}/duplicate`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Access point duplicated successfully",
      });
      queryClient.invalidateQueries({
        queryKey: ['/api/projects', projectId, 'access-points'],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to duplicate access point: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update cell mutation
  const updateCellMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: number; field: string; value: any }) => {
      const res = await apiRequest("PUT", `/api/access-points/${id}`, { 
        [field]: value 
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/projects', projectId, 'access-points'],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update access point: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Handle cell updates
  const handleCellUpdate = (rowIndex: number, columnId: string, value: any) => {
    if (!accessPoints) return;
    
    const accessPoint = accessPoints[rowIndex];
    updateCellMutation.mutate({
      id: accessPoint.id,
      field: columnId,
      value
    });
  };

  // Define columns
  const columnHelper = createColumnHelper<AccessPoint>();
  
  const columns = [
    columnHelper.accessor("location", {
      header: "Location",
      meta: {
        inputType: "text",
      }
    }),
    columnHelper.accessor("description", {
      header: "Description",
      meta: {
        inputType: "text",
      }
    }),
    columnHelper.accessor("readerType", {
      header: "Reader Type",
      meta: {
        inputType: "text",
      }
    }),
    columnHelper.accessor("lockType", {
      header: "Lock Type",
      meta: {
        inputType: "text",
      }
    }),
    columnHelper.accessor("monitoringType", {
      header: "Monitoring Type",
      meta: {
        inputType: "text",
      }
    }),
    columnHelper.accessor("installRequired", {
      header: "Install Required",
      cell: ({ row }) => (
        <Badge variant={row.original.installRequired ? "default" : "outline"}>
          {row.original.installRequired ? "Yes" : "No"}
        </Badge>
      ),
    }),
    columnHelper.accessor("interiorPerimeter", {
      header: "Interior/Perimeter",
      meta: {
        inputType: "text",
      }
    }),
    columnHelper.display("actions", {
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-1 justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setSelectedAccessPointForImages(row.original);
              setIsImageGalleryOpen(true);
            }}
          >
            <FileCog className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setSelectedAccessPoint(row.original);
              setIsEditModalOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => duplicateMutation.mutate(row.original.id)}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this access point?")) {
                deleteMutation.mutate(row.original.id);
              }
            }}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
      meta: {
        readOnly: true,
        hideEditIcon: true,
      },
    }),
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <TopNav />
      <div className="flex-1 container max-w-7xl py-4">
        <div className="mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">Access Points</CardTitle>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Access Point
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">Loading access points...</div>
              ) : isError ? (
                <div className="flex justify-center py-8 text-destructive">
                  Error loading access points
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={accessPoints || []}
                  searchColumn="location"
                  searchPlaceholder="Search locations..."
                  onUpdate={handleCellUpdate}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <AddAccessPointModal
          projectId={Number(projectId)}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedAccessPoint && (
        <EditAccessPointModal
          accessPoint={selectedAccessPoint}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedAccessPoint(null);
          }}
        />
      )}

      {/* Image Gallery */}
      {isImageGalleryOpen && selectedAccessPointForImages && (
        <ImageGallery
          equipmentType="access-points"
          equipmentId={selectedAccessPointForImages.id}
          equipmentName={selectedAccessPointForImages.location}
          onClose={() => {
            setIsImageGalleryOpen(false);
            setSelectedAccessPointForImages(null);
          }}
        />
      )}
    </div>
  );
}
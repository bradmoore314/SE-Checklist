import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Camera } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { createColumnHelper } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Edit, Plus, FileCog, Copy, Trash, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CamerasTableProps {
  project: { id: number };
  onEdit: (camera: Camera) => void;
  onAdd: () => void;
  onShowImages: (camera: Camera) => void;
}

export default function CamerasTable({ 
  project, 
  onEdit, 
  onAdd, 
  onShowImages 
}: CamerasTableProps) {
  const { toast } = useToast();

  // Fetch cameras
  const { 
    data: cameras = [], 
    isLoading, 
    isError 
  } = useQuery<Camera[]>({
    queryKey: [`/api/projects/${project.id}/cameras`],
    enabled: !!project.id,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/cameras/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Camera deleted successfully",
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${project.id}/cameras`],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete camera: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Duplicate mutation
  const duplicateMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/cameras/${id}/duplicate`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Camera duplicated successfully",
      });
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${project.id}/cameras`],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to duplicate camera: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update cell mutation
  const updateCellMutation = useMutation({
    mutationFn: async ({ id, field, value }: { id: number; field: string; value: any }) => {
      const res = await apiRequest("PUT", `/api/cameras/${id}`, { 
        [field]: value 
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [`/api/projects/${project.id}/cameras`],
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update camera: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Handle cell updates
  const handleCellUpdate = (rowIndex: number, columnId: string, value: any) => {
    if (!cameras || cameras.length === 0) return;
    
    const camera = cameras[rowIndex];
    
    // Map column IDs to database fields
    const fieldMap: Record<string, string> = {
      location: 'location',
      cameraType: 'camera_type',
      mountingType: 'mounting_type',
      resolution: 'resolution',
      fieldOfView: 'field_of_view',
      indoorOutdoor: 'indoor_outdoor',
      notes: 'notes'
    };
    
    const field = fieldMap[columnId] || columnId;
    
    updateCellMutation.mutate({
      id: camera.id,
      field,
      value
    });
  };

  // Define columns
  const columnHelper = createColumnHelper<Camera>();
  
  const columns = [
    columnHelper.accessor(cam => cam.location, {
      id: 'location',
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <span className="font-semibold">LOCATION</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row, getValue }) => (
        <div className="font-medium">{getValue()}</div>
      ),
      meta: {
        inputType: "text"
      }
    }),
    columnHelper.accessor(cam => cam.camera_type, {
      id: 'cameraType',
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <span className="font-semibold">CAMERA TYPE</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      meta: {
        inputType: "text"
      }
    }),
    columnHelper.accessor(cam => cam.mounting_type, {
      id: 'mountingType',
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <span className="font-semibold">MOUNTING</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      meta: {
        inputType: "text"
      }
    }),
    columnHelper.accessor(cam => cam.resolution, {
      id: 'resolution',
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <span className="font-semibold">RESOLUTION</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      meta: {
        inputType: "text"
      }
    }),
    columnHelper.accessor(cam => cam.indoor_outdoor, {
      id: 'indoorOutdoor',
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <span className="font-semibold">IN/OUT</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const type = row.original.indoor_outdoor;
        return (
          <div>
            {type === "Indoor" ? (
              <Badge variant="outline">Indoor</Badge>
            ) : (
              <Badge>Outdoor</Badge>
            )}
          </div>
        );
      },
      meta: {
        inputType: "text",
        hideEditIcon: true
      }
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="font-semibold">ACTIONS</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onShowImages(row.original)}
            className="h-8 w-8"
          >
            <FileCog className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => duplicateMutation.mutate(row.original.id)}
            className="h-8 w-8"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this camera?")) {
                deleteMutation.mutate(row.original.id);
              }
            }}
            className="h-8 w-8"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
      meta: {
        readOnly: true,
        hideEditIcon: true
      }
    }),
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-xl font-medium">Cameras</CardTitle>
        <Button onClick={onAdd} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Camera
        </Button>
      </CardHeader>
      <CardContent className="p-0 pb-4">
        {isLoading ? (
          <div className="flex justify-center py-8">Loading cameras...</div>
        ) : isError ? (
          <div className="flex justify-center py-8 text-destructive">
            Error loading cameras
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={cameras}
            searchColumn="location"
            searchPlaceholder="Search cameras..."
            onUpdate={handleCellUpdate}
          />
        )}
      </CardContent>
    </Card>
  );
}
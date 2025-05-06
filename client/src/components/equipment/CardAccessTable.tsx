import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AccessPoint } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { createColumnHelper } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Edit, Plus, FileCog, Copy, Trash, Filter, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EquipmentExportButton from "@/components/EquipmentExportButton";

interface CardAccessTableProps {
  project: { id: number; name?: string };
  onEdit: (accessPoint: AccessPoint) => void;
  onAdd: () => void;
  onShowImages: (accessPoint: AccessPoint) => void;
}

export default function CardAccessTable({ 
  project, 
  onEdit, 
  onAdd, 
  onShowImages 
}: CardAccessTableProps) {
  const { toast } = useToast();

  // Fetch access points
  const { 
    data: accessPoints = [], 
    isLoading, 
    isError 
  } = useQuery<AccessPoint[]>({
    queryKey: [`/api/projects/${project.id}/access-points`],
    enabled: !!project.id,
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
        queryKey: [`/api/projects/${project.id}/access-points`],
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
        queryKey: [`/api/projects/${project.id}/access-points`],
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
        queryKey: [`/api/projects/${project.id}/access-points`],
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
    if (!accessPoints || accessPoints.length === 0) return;
    
    const accessPoint = accessPoints[rowIndex];
    
    // Map column IDs to database fields
    const fieldMap: Record<string, string> = {
      location: 'location',
      quickConfig: 'quick_config',
      readerType: 'reader_type',
      lockType: 'lock_type',
      monitoringType: 'monitoring_type',
      interiorPerimeter: 'interior_perimeter',
      notes: 'notes'
    };
    
    const field = fieldMap[columnId] || columnId;
    
    updateCellMutation.mutate({
      id: accessPoint.id,
      field,
      value
    });
  };

  // Define columns
  const columnHelper = createColumnHelper<AccessPoint>();
  
  const columns = [
    columnHelper.accessor(ap => ap.location, {
      id: 'location',
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className="p-0 hover:bg-transparent group text-gray-700" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className="font-semibold text-sm tracking-wide">LOCATION</span>
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          </Button>
        </div>
      ),
      cell: ({ row, getValue }) => (
        <div className="font-medium text-gray-800">{getValue()}</div>
      ),
      meta: {
        className: "w-1/5",
        inputType: "text"
      }
    }),
    columnHelper.accessor(ap => ap.quick_config, {
      id: 'quickConfig',
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className="p-0 hover:bg-transparent group text-gray-700" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className="font-semibold text-sm tracking-wide">QUICK CONFIG</span>
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          </Button>
        </div>
      ),
      cell: ({ row, getValue }) => (
        <div className="text-gray-700">{getValue()}</div>
      ),
      meta: {
        inputType: "text"
      }
    }),
    columnHelper.accessor(ap => ap.reader_type, {
      id: 'readerType',
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className="p-0 hover:bg-transparent group text-gray-700" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className="font-semibold text-sm tracking-wide">READER TYPE</span>
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          </Button>
        </div>
      ),
      cell: ({ row, getValue }) => (
        <div className="text-gray-700">{getValue()}</div>
      ),
      meta: {
        inputType: "text"
      }
    }),
    columnHelper.accessor(ap => ap.lock_type, {
      id: 'lockType',
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className="p-0 hover:bg-transparent group text-gray-700" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className="font-semibold text-sm tracking-wide">LOCK TYPE</span>
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          </Button>
        </div>
      ),
      cell: ({ row, getValue }) => (
        <div className="text-gray-700">{getValue()}</div>
      ),
      meta: {
        inputType: "text"
      }
    }),
    columnHelper.accessor(ap => ap.monitoring_type, {
      id: 'monitoringType',
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className="p-0 hover:bg-transparent group text-gray-700" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className="font-semibold text-sm tracking-wide">MONITORING</span>
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          </Button>
        </div>
      ),
      cell: ({ row, getValue }) => (
        <div className="text-gray-700">{getValue()}</div>
      ),
      meta: {
        inputType: "text"
      }
    }),
    columnHelper.accessor(ap => ap.takeover, {
      id: 'takeover',
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className="p-0 hover:bg-transparent group text-gray-700" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className="font-semibold text-sm tracking-wide">TAKEOVER</span>
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const takeover = row.original.takeover;
        return (
          <div>
            {takeover === "Yes" ? (
              <Badge variant="default" className="bg-red-600 font-medium">Yes</Badge>
            ) : (
              <Badge variant="secondary" className="font-medium">No</Badge>
            )}
          </div>
        );
      },
      meta: {
        inputType: "text",
        hideEditIcon: true
      }
    }),
    columnHelper.accessor(ap => ap.interior_perimeter, {
      id: 'interiorPerimeter',
      header: ({ column }) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            className="p-0 hover:bg-transparent group text-gray-700" 
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className="font-semibold text-sm tracking-wide">INT/PER</span>
            <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          </Button>
        </div>
      ),
      cell: ({ row, getValue }) => (
        <div className="text-gray-700">{getValue()}</div>
      ),
      meta: {
        inputType: "text"
      }
    }),
    columnHelper.display({
      id: "actions",
      header: () => <span className="font-semibold text-sm tracking-wide text-gray-700">ACTIONS</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onShowImages(row.original)}
            className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <FileCog className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => duplicateMutation.mutate(row.original.id)}
            className="h-8 w-8 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this access point?")) {
                deleteMutation.mutate(row.original.id);
              }
            }}
            className="h-8 w-8 rounded-full text-gray-500 hover:text-red-700 hover:bg-red-50"
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
    <Card className="shadow-sm border-gray-100">
      <CardHeader className="flex flex-row items-center justify-between p-5 bg-white border-b border-gray-100">
        <div>
          <CardTitle className="text-xl font-medium text-gray-800">Card Access Points</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Manage access point equipment for this project
          </p>
        </div>
        <div className="flex gap-3">
          <EquipmentExportButton 
            data={accessPoints}
            equipmentType="Access Points"
            projectName={project?.name || "Project"}
            disabled={isLoading || accessPoints.length === 0}
          />
          <Button 
            onClick={onAdd} 
            className="bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Access Point
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 border-t-2 border-b-2 border-gray-300 rounded-full animate-spin mb-3"></div>
              <p className="text-gray-500">Loading access points...</p>
            </div>
          </div>
        ) : isError ? (
          <div className="flex justify-center py-8 text-destructive">
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-red-100 p-3 mb-3">
                <span className="text-red-500 text-xl">!</span>
              </div>
              <p className="text-red-600 font-medium">Error loading access points</p>
              <p className="text-sm text-gray-500 mt-1">Please try again later</p>
            </div>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={accessPoints}
            searchColumn="location"
            searchPlaceholder="Search locations..."
            onUpdate={handleCellUpdate}
          />
        )}
      </CardContent>
    </Card>
  );
}
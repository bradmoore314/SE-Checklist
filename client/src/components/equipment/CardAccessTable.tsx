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

interface CardAccessTableProps {
  project: { id: number };
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
        className: "w-1/5",
        inputType: "text"
      }
    }),
    columnHelper.accessor(ap => ap.quick_config, {
      id: 'quickConfig',
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <span className="font-semibold">QUICK CONFIG</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      meta: {
        inputType: "text"
      }
    }),
    columnHelper.accessor(ap => ap.reader_type, {
      id: 'readerType',
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <span className="font-semibold">READER TYPE</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      meta: {
        inputType: "text"
      }
    }),
    columnHelper.accessor(ap => ap.lock_type, {
      id: 'lockType',
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <span className="font-semibold">LOCK TYPE</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      meta: {
        inputType: "text"
      }
    }),
    columnHelper.accessor(ap => ap.monitoring_type, {
      id: 'monitoringType',
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <span className="font-semibold">MONITORING</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      meta: {
        inputType: "text"
      }
    }),
    columnHelper.accessor(ap => ap.takeover, {
      id: 'takeover',
      header: ({ column }) => (
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <span className="font-semibold">TAKEOVER</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      cell: ({ row }) => {
        const takeover = row.original.takeover;
        return (
          <div>
            {takeover === "Yes" ? (
              <Badge variant="default" className="bg-red-600">Yes</Badge>
            ) : (
              <Badge variant="secondary">No</Badge>
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
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <span className="font-semibold">INT/PER</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
      meta: {
        inputType: "text"
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
              if (window.confirm("Are you sure you want to delete this access point?")) {
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
        <CardTitle className="text-xl font-medium">Card Access Points</CardTitle>
        <Button onClick={onAdd} className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add Access Point
        </Button>
      </CardHeader>
      <CardContent className="p-0 pb-4">
        {isLoading ? (
          <div className="flex justify-center py-8">Loading access points...</div>
        ) : isError ? (
          <div className="flex justify-center py-8 text-destructive">
            Error loading access points
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
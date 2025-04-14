import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AccessPoint } from "@shared/schema";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Edit, Plus, FileCog, Copy, Trash, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CardAccessTableProps {
  project: { id: number };
  onEdit: (accessPoint: AccessPoint) => void;
  onAdd: () => void;
  onShowImages: (accessPoint: AccessPoint) => void;
}

export default function SimpleCardAccessTable({ 
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

  // Define columns
  const columns = [
    {
      accessorKey: "location",
      header: ({ column }: any) => (
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="p-0 hover:bg-transparent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            <span className="font-semibold">LOCATION</span>
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: "quick_config",
      header: "QUICK CONFIG",
    },
    {
      accessorKey: "reader_type",
      header: "READER TYPE",
    },
    {
      accessorKey: "lock_type",
      header: "LOCK TYPE",
    },
    {
      accessorKey: "monitoring_type",
      header: "MONITORING",
    },
    {
      accessorKey: "interior_perimeter",
      header: "INT/PER",
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
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
    },
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
            searchPlaceholder="Search access points..."
          />
        )}
      </CardContent>
    </Card>
  );
}
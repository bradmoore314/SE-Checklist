import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { AddCollaboratorModal } from "@/components/modals/AddCollaboratorModal";
import { useProjectCollaborators, AddCollaboratorData } from "@/hooks/use-collaborators";
import { PERMISSION } from "@shared/schema";
import { 
  UserPlus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserX, 
  Shield, 
  Eye, 
  Pencil 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProjectCollaboratorsProps {
  projectId: number;
}

export function ProjectCollaborators({ projectId }: ProjectCollaboratorsProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [removeCollaboratorId, setRemoveCollaboratorId] = useState<number | null>(null);
  
  const {
    collaborators,
    isLoading,
    canManageCollaborators,
    addCollaborator,
    isAddingCollaborator,
    updateCollaborator,
    removeCollaborator,
    isRemovingCollaborator
  } = useProjectCollaborators(projectId);

  const handleAddCollaborator = (data: AddCollaboratorData) => {
    addCollaborator(data);
  };

  const handleUpdatePermission = (id: number, permission: string) => {
    updateCollaborator({ id, data: { permission } });
  };

  const handleRemoveCollaborator = () => {
    if (removeCollaboratorId) {
      removeCollaborator(removeCollaboratorId);
      setRemoveCollaboratorId(null);
    }
  };

  const getPermissionBadge = (permission: string) => {
    switch (permission) {
      case PERMISSION.ADMIN:
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600">
            <Shield className="h-3.5 w-3.5 mr-1" />
            Admin
          </Badge>
        );
      case PERMISSION.EDIT:
        return (
          <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white">
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Editor
          </Badge>
        );
      case PERMISSION.VIEW:
        return (
          <Badge variant="outline">
            <Eye className="h-3.5 w-3.5 mr-1" />
            Viewer
          </Badge>
        );
      default:
        return <Badge variant="outline">{permission}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">Project Collaborators</CardTitle>
            <CardDescription>
              Manage team members who can access this project
            </CardDescription>
          </div>
          {canManageCollaborators && (
            <Button 
              size="sm" 
              onClick={() => setIsAddModalOpen(true)}
              className="ml-auto"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Collaborator
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : collaborators.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No collaborators found. Add team members to collaborate on this project.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Permission</TableHead>
                  {canManageCollaborators && <TableHead className="w-[100px]">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaborators.map((collaborator) => (
                  <TableRow key={collaborator.id}>
                    <TableCell className="font-medium">
                      {collaborator.user_id}
                    </TableCell>
                    <TableCell>user@example.com</TableCell>
                    <TableCell>
                      {getPermissionBadge(collaborator.permission)}
                    </TableCell>
                    {canManageCollaborators && (
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleUpdatePermission(collaborator.id, PERMISSION.ADMIN)}
                              disabled={collaborator.permission === PERMISSION.ADMIN}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdatePermission(collaborator.id, PERMISSION.EDIT)}
                              disabled={collaborator.permission === PERMISSION.EDIT}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Make Editor
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdatePermission(collaborator.id, PERMISSION.VIEW)}
                              disabled={collaborator.permission === PERMISSION.VIEW}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Make Viewer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setRemoveCollaboratorId(collaborator.id)}
                              className="text-red-600 focus:text-red-500"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          <div className="flex items-center">
            <p className="mr-2">Permission levels:</p>
            <Badge variant="outline" className="mr-1">Viewer</Badge>
            <span className="mr-1">can view,</span>
            <Badge variant="secondary" className="bg-blue-500 text-white mr-1">Editor</Badge>
            <span className="mr-1">can edit,</span>
            <Badge className="bg-amber-500 mr-1">Admin</Badge>
            <span>can manage collaborators</span>
          </div>
        </CardFooter>
      </Card>

      <AddCollaboratorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCollaborator={handleAddCollaborator}
        isLoading={isAddingCollaborator}
      />

      <AlertDialog open={!!removeCollaboratorId} onOpenChange={(open) => !open && setRemoveCollaboratorId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Collaborator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this collaborator? They will no longer have access to the project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveCollaborator}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isRemovingCollaborator}
            >
              {isRemovingCollaborator ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
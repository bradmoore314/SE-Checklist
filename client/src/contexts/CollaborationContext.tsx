import React, { createContext, useContext, ReactNode } from "react";
import { useProjectCollaborators, AddCollaboratorData, UpdateCollaboratorData } from "@/hooks/use-collaborators";
import { ProjectCollaborator } from "@shared/schema";

// Define the context type
interface CollaborationContextType {
  collaborators: ProjectCollaborator[];
  isLoading: boolean;
  error: Error | null;
  canManageCollaborators: boolean;
  projectPermission: string | null;
  isPermissionLoading: boolean;
  addCollaborator: (data: AddCollaboratorData) => void;
  updateCollaborator: (params: { id: number; data: UpdateCollaboratorData }) => void;
  removeCollaborator: (id: number) => void;
  isAddingCollaborator: boolean;
  isUpdatingCollaborator: boolean;
  isRemovingCollaborator: boolean;
  refetchCollaborators: () => void;
}

// Create the context with initial values
const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

// Provider component
interface CollaborationProviderProps {
  children: ReactNode;
  projectId: number;
}

export function CollaborationProvider({ children, projectId }: CollaborationProviderProps) {
  const {
    collaborators,
    isLoading,
    error,
    refetch: refetchCollaborators,
    addCollaborator,
    updateCollaborator,
    removeCollaborator,
    isAddingCollaborator,
    isUpdatingCollaborator,
    isRemovingCollaborator,
    canManageCollaborators,
    isPermissionLoading,
    projectPermission
  } = useProjectCollaborators(projectId);

  const value = {
    collaborators,
    isLoading,
    error,
    canManageCollaborators,
    projectPermission,
    isPermissionLoading,
    addCollaborator,
    updateCollaborator,
    removeCollaborator,
    isAddingCollaborator,
    isUpdatingCollaborator,
    isRemovingCollaborator,
    refetchCollaborators
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
}

// Custom hook to use the collaboration context
export function useCollaboration() {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error("useCollaboration must be used within a CollaborationProvider");
  }
  return context;
}
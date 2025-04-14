import { useState } from "react";
import { AccessPoint, Project } from "@shared/schema";
import { useQueryClient } from "@tanstack/react-query";
import AddAccessPointModal from "../modals/AddAccessPointModal";
import EditAccessPointModal from "../modals/EditAccessPointModal";
import { ImageGallery } from "../ImageGallery";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SimpleCardAccessTable from "./SimpleCardAccessTable";

interface CardAccessTabProps {
  project: Project;
}

export default function CardAccessTab({ project }: CardAccessTabProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedAccessPoint, setSelectedAccessPoint] = useState<AccessPoint | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  const handleShowEditModal = (accessPoint: AccessPoint) => {
    setSelectedAccessPoint(accessPoint);
    setShowEditModal(true);
  };

  const handleShowImageModal = (accessPoint: AccessPoint) => {
    setSelectedAccessPoint(accessPoint);
    setShowImageModal(true);
  };

  return (
    <div className="p-4">
      {/* New Data Table with Sorting, Filtering, and Editable Cells */}
      <SimpleCardAccessTable 
        project={project}
        onEdit={handleShowEditModal}
        onAdd={() => setShowAddModal(true)}
        onShowImages={handleShowImageModal}
      />
      
      {/* Add Access Point Modal */}
      {showAddModal && (
        <AddAccessPointModal 
          isOpen={showAddModal} 
          projectId={project.id} 
          onSave={handleAddSave} 
          onClose={() => setShowAddModal(false)} 
        />
      )}
      
      {/* Edit Access Point Modal */}
      {showEditModal && selectedAccessPoint && (
        <EditAccessPointModal 
          isOpen={showEditModal} 
          accessPoint={selectedAccessPoint} 
          onSave={handleEditSave} 
          onClose={() => {
            setShowEditModal(false);
            setSelectedAccessPoint(null);
          }} 
        />
      )}

      {/* Image Gallery Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Images for {selectedAccessPoint?.location || 'Access Point'}</DialogTitle>
          </DialogHeader>
          {selectedAccessPoint && showImageModal && (
            <ImageGallery 
              equipmentType="access-points" 
              equipmentId={selectedAccessPoint.id} 
              equipmentName={selectedAccessPoint.location}
              onClose={() => setShowImageModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
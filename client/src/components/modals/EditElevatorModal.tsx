import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, ImageIcon } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import ImagePreview from "@/components/ImagePreview";
import ImageUploadModal from "@/components/modals/ImageUploadModal";
import ImageGalleryModal from "@/components/modals/ImageGalleryModal";

// Define the schema for the elevator form
const elevatorSchema = z.object({
  location: z.string().min(1, "Location is required"),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  number_of_floors: z.coerce.number().min(0).optional(),
  control_board_location: z.string().optional(),
  notes: z.string().optional(),
});

type ElevatorFormValues = z.infer<typeof elevatorSchema>;

interface Elevator {
  id: number;
  project_id: number;
  location: string;
  manufacturer?: string;
  model?: string;
  number_of_floors?: number;
  control_board_location?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface EditElevatorModalProps {
  isOpen: boolean;
  elevator: Elevator;
  onClose: () => void;
  onSave: (id: number, data: Elevator) => void;
  fromFloorplan?: boolean;
  isNewElevator?: boolean;
}

export default function EditElevatorModal({
  isOpen,
  elevator,
  onClose,
  onSave,
  fromFloorplan = false,
  isNewElevator = false
}: EditElevatorModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Set up form with default values from the existing elevator
  const form = useForm<ElevatorFormValues>({
    resolver: zodResolver(elevatorSchema),
    defaultValues: {
      location: elevator.location,
      manufacturer: elevator.manufacturer || "",
      model: elevator.model || "",
      number_of_floors: elevator.number_of_floors || 0,
      control_board_location: elevator.control_board_location || "",
      notes: elevator.notes || "",
    },
  });

  const onSubmit = async (values: ElevatorFormValues) => {
    setIsSubmitting(true);
    
    try {
      // If it's a new elevator, create it
      if (isNewElevator) {
        try {
          const response = await apiRequest("POST", `/api/projects/${elevator.project_id}/elevators`, values);
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server responded with ${response.status}: ${errorText}`);
          }
          const newElevator = await response.json();
          
          // Invalidate elevators query
          queryClient.invalidateQueries({ 
            queryKey: [`/api/projects/${elevator.project_id}/elevators`]
          });
          
          // Call onSave with the new elevator ID and data
          onSave(newElevator.id, { ...newElevator });
          
          toast({
            title: "Success",
            description: "Elevator created successfully",
          });
        } catch (err) {
          console.error("Error creating elevator:", err);
          throw err;
        }
      } else {
        // Otherwise, update the existing elevator
        const response = await apiRequest("PUT", `/api/elevators/${elevator.id}`, values);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server responded with ${response.status}: ${errorText}`);
        }
        
        // Invalidate elevators query
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${elevator.project_id}/elevators`]
        });
        
        // Call onSave to refresh the parent component
        onSave(elevator.id, { ...elevator, ...values });
        
        toast({
          title: "Success",
          description: "Elevator updated successfully",
        });
      }
    } catch (error) {
      console.error("Error saving elevator:", error);
      toast({
        title: "Error",
        description: "Failed to save elevator. " + (error instanceof Error ? error.message : ""),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isNewElevator ? "Add Elevator" : "Edit Elevator"}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              {/* Manufacturer */}
              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Otis, ThyssenKrupp" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Model */}
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter model" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Number of Floors */}
              <FormField
                control={form.control}
                name="number_of_floors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Floors</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Control Board Location */}
              <FormField
                control={form.control}
                name="control_board_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Control Board Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Basement, Maintenance Room" autoComplete="off" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional information"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Image Preview Section */}
            <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
              <h3 className="text-lg font-medium">Elevator Images</h3>
              <div className="flex items-center justify-between">
                <ImagePreview
                  equipmentType="elevator"
                  equipmentId={elevator.id}
                  maxImages={4}
                  onClick={() => setShowImageModal(true)}
                  className="flex-1"
                />
                <div className="flex space-x-2 ml-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center"
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowImageModal(true)}
                    className="flex items-center"
                  >
                    <ImageIcon className="h-4 w-4 mr-1" />
                    View All
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Submit/Cancel buttons */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Elevator'
                )}
              </Button>
            </div>
          </form>
        </Form>
        </ScrollArea>

        {/* Image Upload Modal */}
        {showUploadModal && (
          <ImageUploadModal
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            equipmentType="elevator"
            equipmentId={elevator.id}
            projectId={elevator.project_id}
            equipmentName={`Elevator - ${elevator.location}`}
          />
        )}

        {/* Image Gallery Modal */}
        {showImageModal && (
          <ImageGalleryModal
            isOpen={showImageModal}
            onClose={() => setShowImageModal(false)}
            equipmentType="elevator"
            equipmentId={elevator.id}
            equipmentName={`Elevator - ${elevator.location}`}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
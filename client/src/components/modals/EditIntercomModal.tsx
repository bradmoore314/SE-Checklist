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

// Define the schema for the intercom form
const intercomSchema = z.object({
  location: z.string().min(1, "Location is required"),
  intercom_type: z.string().min(1, "Intercom type is required"),
  connection_type: z.string().min(1, "Connection type is required"),
  mounting_type: z.string().min(1, "Mounting type is required"),
  notes: z.string().optional(),
});

type IntercomFormValues = z.infer<typeof intercomSchema>;

interface Intercom {
  id: number;
  project_id: number;
  location: string;
  intercom_type: string;
  connection_type: string;
  mounting_type: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface EditIntercomModalProps {
  isOpen: boolean;
  intercom: Intercom;
  onClose: () => void;
  onSave: (id: number, data: Intercom) => void;
  fromFloorplan?: boolean;
  isNewIntercom?: boolean;
}

export default function EditIntercomModal({
  isOpen,
  intercom,
  onClose,
  onSave,
  fromFloorplan = false,
  isNewIntercom = false
}: EditIntercomModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Set up form with default values from the existing intercom
  const form = useForm<IntercomFormValues>({
    resolver: zodResolver(intercomSchema),
    defaultValues: {
      location: intercom.location,
      intercom_type: intercom.intercom_type,
      connection_type: intercom.connection_type,
      mounting_type: intercom.mounting_type,
      notes: intercom.notes || "",
    },
  });

  const onSubmit = async (values: IntercomFormValues) => {
    setIsSubmitting(true);
    
    try {
      // If it's a new intercom, create it
      if (isNewIntercom) {
        try {
          const response = await apiRequest("POST", `/api/projects/${intercom.project_id}/intercoms`, values);
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server responded with ${response.status}: ${errorText}`);
          }
          const newIntercom = await response.json();
          
          // Invalidate intercoms query
          queryClient.invalidateQueries({ 
            queryKey: [`/api/projects/${intercom.project_id}/intercoms`]
          });
          
          // Call onSave with the new intercom ID and data
          onSave(newIntercom.id, { ...newIntercom });
          
          toast({
            title: "Success",
            description: "Intercom created successfully",
          });
        } catch (err) {
          console.error("Error creating intercom:", err);
          throw err;
        }
      } else {
        // Otherwise, update the existing intercom
        const response = await apiRequest("PUT", `/api/intercoms/${intercom.id}`, values);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server responded with ${response.status}: ${errorText}`);
        }
        
        // Invalidate intercoms query
        queryClient.invalidateQueries({ 
          queryKey: [`/api/projects/${intercom.project_id}/intercoms`]
        });
        
        // Call onSave to refresh the parent component
        onSave(intercom.id, { ...intercom, ...values });
        
        toast({
          title: "Success",
          description: "Intercom updated successfully",
        });
      }
    } catch (error) {
      console.error("Error saving intercom:", error);
      toast({
        title: "Error",
        description: "Failed to save intercom. " + (error instanceof Error ? error.message : ""),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Intercom type options
  const intercomTypes = [
    "Aiphone",
    "2N",
    "Comelit",
    "ButterflyMX",
    "DoorKing",
    "Linear",
    "Viking",
    "Other"
  ];
  
  // Connection type options
  const connectionTypes = [
    "IP",
    "Analog",
    "Wireless",
    "Cellular",
    "SIP",
    "Other"
  ];
  
  // Mounting type options
  const mountingTypes = [
    "Wall",
    "Pedestal",
    "Surface",
    "Flush",
    "Recessed",
    "Other"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{isNewIntercom ? "Add Intercom" : "Edit Intercom"}</DialogTitle>
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
            
            {/* Intercom Type */}
            <FormField
              control={form.control}
              name="intercom_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intercom Type *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select intercom type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {intercomTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              {/* Connection Type */}
              <FormField
                control={form.control}
                name="connection_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connection Type *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select connection type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {connectionTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Mounting Type */}
              <FormField
                control={form.control}
                name="mounting_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mounting Type *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select mounting type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mountingTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
              <h3 className="text-lg font-medium">Intercom Images</h3>
              <div className="flex items-center justify-between">
                <ImagePreview
                  equipmentType="intercom"
                  equipmentId={intercom.id}
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
                  'Save Intercom'
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
            equipmentType="intercom"
            equipmentId={intercom.id}
            projectId={intercom.project_id}
            equipmentName={`Intercom - ${intercom.location}`}
          />
        )}

        {/* Image Gallery Modal */}
        {showImageModal && (
          <ImageGalleryModal
            isOpen={showImageModal}
            onClose={() => setShowImageModal(false)}
            equipmentType="intercom"
            equipmentId={intercom.id}
            equipmentName={`Intercom - ${intercom.location}`}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
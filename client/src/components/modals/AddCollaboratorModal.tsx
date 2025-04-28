import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { AddCollaboratorData } from "@/hooks/use-collaborators";
import { PERMISSION } from "@shared/schema";

// Define the schema for the form
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  permission: z.enum([PERMISSION.VIEW, PERMISSION.EDIT, PERMISSION.ADMIN], {
    required_error: "Please select a permission level",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface AddCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCollaborator: (data: AddCollaboratorData) => void;
  isLoading: boolean;
}

export function AddCollaboratorModal({
  isOpen,
  onClose,
  onAddCollaborator,
  isLoading,
}: AddCollaboratorModalProps) {
  const { toast } = useToast();
  const [userNotFoundError, setUserNotFoundError] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      permission: PERMISSION.VIEW,
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      // Look up the user by email
      const response = await fetch(`/api/lookup/users?email=${encodeURIComponent(data.email)}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setUserNotFoundError(true);
          toast({
            title: "User not found",
            description: "No user found with this email address. They must register first.",
            variant: "destructive",
          });
          return;
        }
        throw new Error("Failed to look up user");
      }
      
      const user = await response.json();
      
      onAddCollaborator({
        user_id: user.id,
        permission: data.permission,
      });
      
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error adding collaborator:", error);
      toast({
        title: "Error",
        description: "Failed to add collaborator. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Collaborator</DialogTitle>
          <DialogDescription>
            Invite a team member to collaborate on this project.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="collaborator@example.com"
                      {...field}
                      onChange={(e) => {
                        setUserNotFoundError(false);
                        field.onChange(e);
                      }}
                    />
                  </FormControl>
                  {userNotFoundError && (
                    <p className="text-sm text-destructive">
                      User with this email not found. They must register first.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permission"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permission Level</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select permission level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={PERMISSION.VIEW}>
                        View Only (can view but not edit)
                      </SelectItem>
                      <SelectItem value={PERMISSION.EDIT}>
                        Editor (can view and edit)
                      </SelectItem>
                      <SelectItem value={PERMISSION.ADMIN}>
                        Admin (full control, can manage collaborators)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Collaborator"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
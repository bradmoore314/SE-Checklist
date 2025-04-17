import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { StreamImage } from "../../types";

interface StreamImagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamName: string;
  images: StreamImage[];
  onDeleteImage?: (imageId: number) => void;
}

const StreamImagesModal: React.FC<StreamImagesModalProps> = ({
  isOpen,
  onClose,
  streamName,
  images,
  onDeleteImage,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Stream Images: {streamName || "Unnamed Stream"}</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </div>
          <DialogDescription>
            {images.length} {images.length === 1 ? "image" : "images"} for this stream
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-grow overflow-auto">
          {images.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              No images uploaded for this stream.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
              {images.map((image) => (
                <div key={image.id} className="relative rounded-md border overflow-hidden group">
                  <img
                    src={`data:image/jpeg;base64,${image.imageData}`}
                    alt={image.filename}
                    className="w-full h-auto"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{image.filename}</span>
                      {onDeleteImage && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDeleteImage(image.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default StreamImagesModal;
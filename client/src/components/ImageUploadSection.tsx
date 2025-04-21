import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Camera, X, Loader2 } from 'lucide-react';

// Image Upload Section Component
interface ImageUploadSectionProps {
  projectId: number;
  equipmentId?: number;
  equipmentType?: string;
}

function ImageUploadSection({ 
  projectId, 
  equipmentId = -1, 
  equipmentType = 'access_point' 
}: ImageUploadSectionProps) {
  const [images, setImages] = useState<Array<{ id?: number, file?: File, data?: string, filename?: string }>>([]);
  const [takingPhoto, setTakingPhoto] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing images if equipmentId is provided
  const { data: existingImages = [], isLoading: loadingImages } = useQuery({
    queryKey: ['/api/equipment-images', equipmentType, equipmentId],
    queryFn: async () => {
      if (equipmentId <= 0) return [];
      
      const response = await apiRequest('GET', `/api/equipment-images/${equipmentType}/${equipmentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      return response.json();
    },
    enabled: equipmentId > 0,
  });

  // Load existing images when they're fetched
  useEffect(() => {
    if (existingImages && existingImages.length > 0) {
      setImages(existingImages.map((img: any) => ({
        id: img.id,
        data: img.image_data,
        filename: img.filename || 'Uploaded Image'
      })));
    }
  }, [existingImages]);

  // Image upload mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (data: { 
      equipment_type: string, 
      equipment_id: number, 
      project_id: number, 
      image_data: string, 
      filename: string | null 
    }) => {
      const response = await apiRequest('POST', '/api/equipment-images', data);
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
      
      // Refresh images list
      queryClient.invalidateQueries({ queryKey: ['/api/equipment-images', equipmentType, equipmentId] });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  });

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Read the file as data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        // Add the new image to the list
        const newImage = {
          file,
          data: reader.result as string,
          filename: file.name
        };
        
        setImages(prev => [...prev, newImage]);
        
        // If there's an equipment ID, upload it immediately
        if (equipmentId > 0) {
          handleUploadImage(newImage);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle taking photo with camera
  const handleTakePhoto = async () => {
    setTakingPhoto(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
      setTakingPhoto(false);
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to the canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg');
        
        // Add the captured image
        const newImage = {
          data: dataUrl,
          filename: `Photo_${new Date().toISOString().split('T')[0]}.jpg`
        };
        
        setImages(prev => [...prev, newImage]);
        
        // If there's an equipment ID, upload it immediately
        if (equipmentId > 0) {
          handleUploadImage(newImage);
        }
        
        // Stop the camera
        stopCamera();
      }
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setTakingPhoto(false);
  };

  // Handle image upload to server
  const handleUploadImage = async (image: { data?: string, filename?: string }) => {
    if (!image.data) return;
    
    setUploadingImage(true);
    
    try {
      // Extract the base64 data without the prefix
      const base64Data = image.data.split(',')[1];
      
      await uploadImageMutation.mutateAsync({
        equipment_type: equipmentType,
        equipment_id: equipmentId,
        project_id: projectId,
        image_data: base64Data,
        filename: image.filename || null
      });
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle removing an image
  const handleRemoveImage = (index: number) => {
    const imageToRemove = images[index];
    
    // If the image has an ID, it's stored on the server
    if (imageToRemove.id) {
      // TODO: Implement API call to delete the image
      // For now, just remove it from the local state
      toast({
        title: "Not Yet Implemented",
        description: "Deleting existing images will be implemented in a future update.",
        variant: "default",
      });
    } else {
      // Otherwise just remove it from the local state
      setImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-4">
      {/* Image gallery */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {images.map((image, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-2 relative">
                <div className="relative pb-[75%]">
                  {image.data && (
                    <img 
                      src={image.data} 
                      alt={image.filename || 'Equipment Image'} 
                      className="absolute inset-0 w-full h-full object-cover rounded-md"
                    />
                  )}
                </div>
                <button 
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X size={14} />
                </button>
                {image.filename && (
                  <div className="text-xs mt-1 truncate">{image.filename}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Image capture/upload controls */}
      <div className="flex flex-wrap gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-1" />
          Upload Image
        </Button>
        
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={handleTakePhoto}
        >
          <Camera className="h-4 w-4 mr-1" />
          Take Photo
        </Button>
        
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
          onClick={e => (e.target as HTMLInputElement).value = ''}
        />
      </div>
      
      {/* Camera view for taking photos */}
      {takingPhoto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-md">
            <h3 className="text-lg font-medium mb-2">Take a Photo</h3>
            
            <div className="relative w-full pb-[75%] bg-gray-100 rounded overflow-hidden">
              <video 
                ref={videoRef} 
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay 
                playsInline
              />
            </div>
            
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={stopCamera}>Cancel</Button>
              <Button onClick={capturePhoto}>
                <Camera className="h-4 w-4 mr-1" />
                Capture
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading indicator during upload */}
      {uploadingImage && (
        <div className="flex items-center mt-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          Uploading image...
        </div>
      )}
    </div>
  );
}

export default ImageUploadSection;
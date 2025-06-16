import { supabase } from './supabase';
import { apiRequest } from './queryClient';

// Primary upload function - tries Supabase first, falls back to base64
export const uploadEquipmentImage = async (
  file: File,
  equipmentType: string,
  equipmentId: number,
  projectId: number
): Promise<string> => {
  
  // Try Supabase upload first
  if (supabase) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${equipmentType}_${equipmentId}_${Date.now()}.${fileExt}`;
      const filePath = `equipment_images/${projectId}/${equipmentType}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('equipment-images')
        .upload(filePath, file);

      if (!error) {
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('equipment-images')
          .getPublicUrl(filePath);

        return urlData.publicUrl;
      }
    } catch (supabaseError) {
      console.warn('Supabase upload failed, using fallback storage:', supabaseError);
    }
  }

  // Fallback: Convert to base64 and store in database
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

// Save image metadata to database
export const saveImageMetadata = async (
  projectId: number,
  equipmentType: string,
  equipmentId: number,
  imageUrl: string,
  fileName: string,
  fileSize: number,
  mimeType: string
) => {
  const imageData = {
    project_id: projectId,
    equipment_type: equipmentType,
    equipment_id: equipmentId,
    image_url: imageUrl,
    image_name: fileName,
    file_size: fileSize,
    mime_type: mimeType,
    metadata: {
      original_name: fileName,
      upload_timestamp: new Date().toISOString(),
      file_size_formatted: `${(fileSize / 1024).toFixed(1)} KB`,
      storage_type: imageUrl.startsWith('data:') ? 'base64' : 'supabase'
    }
  };

  return apiRequest("POST", `/api/equipment/${equipmentType}/${equipmentId}/images`, imageData);
};

// Helper to check if image is base64 encoded
export const isBase64Image = (url: string): boolean => {
  return url.startsWith('data:image/');
};

// Helper to get file size from base64
export const getBase64FileSize = (base64String: string): number => {
  const base64Data = base64String.split(',')[1];
  const padding = (base64Data.match(/=/g) || []).length;
  return Math.floor((base64Data.length * 3) / 4) - padding;
};
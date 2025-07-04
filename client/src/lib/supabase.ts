import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single instance of the Supabase client to avoid multiple client warnings
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper function to check if bucket exists (bucket should be created manually in Supabase dashboard)
export const checkBucketExists = async (bucketName: string) => {
  if (!supabase) {
    throw new Error("Supabase client not initialized. Please check your environment variables.");
  }

  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      throw new Error(`Storage bucket '${bucketName}' not found. Please create it manually in your Supabase dashboard:\n\n1. Go to Storage > Buckets\n2. Create bucket named '${bucketName}'\n3. Make it public\n4. Set 10MB file size limit\n5. Allow image MIME types`);
    }
  } catch (error) {
    // If listing buckets fails, proceed anyway - bucket might exist but permissions might be restricted
    console.warn('Could not verify bucket existence, proceeding with upload attempt');
  }
};

// Helper function to upload file to equipment images bucket
export const uploadEquipmentImage = async (
  file: File, 
  equipmentType: string, 
  equipmentId: number, 
  projectId: number
): Promise<string> => {
  if (!supabase) {
    throw new Error("Supabase client not initialized. Please check your environment variables.");
  }

  // Skip bucket check for now - bucket creation requires service role permissions
  // await checkBucketExists('equipment-images');

  const fileExt = file.name.split('.').pop();
  const fileName = `${equipmentType}_${equipmentId}_${Date.now()}.${fileExt}`;
  const filePath = `equipment_images/${projectId}/${equipmentType}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('equipment-images')
    .upload(filePath, file);

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('equipment-images')
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};
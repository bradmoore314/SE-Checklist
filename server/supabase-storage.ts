/**
 * Server-side Supabase integration for unified storage
 * Handles database operations and storage management
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export class SupabaseStorageService {
  // Project operations
  async getProjects(userId?: string) {
    let query = supabase.from('projects').select('*');
    
    if (userId) {
      query = query.eq('created_by', userId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getProject(id: number) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async createProject(project: any, userId?: string) {
    const projectData = {
      ...project,
      created_by: userId
    };

    const { data, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateProject(id: number, updates: any) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteProject(id: number) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Camera operations
  async getCameras(projectId: number) {
    const { data, error } = await supabase
      .from('cameras')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async createCamera(camera: any) {
    const { data, error } = await supabase
      .from('cameras')
      .insert(camera)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateCamera(id: number, updates: any) {
    const { data, error } = await supabase
      .from('cameras')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteCamera(id: number) {
    const { error } = await supabase
      .from('cameras')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Access Point operations
  async getAccessPoints(projectId: number) {
    const { data, error } = await supabase
      .from('access_points')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async createAccessPoint(accessPoint: any) {
    const { data, error } = await supabase
      .from('access_points')
      .insert(accessPoint)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateAccessPoint(id: number, updates: any) {
    const { data, error } = await supabase
      .from('access_points')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteAccessPoint(id: number) {
    const { error } = await supabase
      .from('access_points')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Elevator operations
  async getElevators(projectId: number) {
    const { data, error } = await supabase
      .from('elevators')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async createElevator(elevator: any) {
    const { data, error } = await supabase
      .from('elevators')
      .insert(elevator)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateElevator(id: number, updates: any) {
    const { data, error } = await supabase
      .from('elevators')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteElevator(id: number) {
    const { error } = await supabase
      .from('elevators')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Intercom operations
  async getIntercoms(projectId: number) {
    const { data, error } = await supabase
      .from('intercoms')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async createIntercom(intercom: any) {
    const { data, error } = await supabase
      .from('intercoms')
      .insert(intercom)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateIntercom(id: number, updates: any) {
    const { data, error } = await supabase
      .from('intercoms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteIntercom(id: number) {
    const { error } = await supabase
      .from('intercoms')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // KVG Stream operations
  async getKvgStreams(projectId: number) {
    const { data, error } = await supabase
      .from('kvg_streams')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async createKvgStream(stream: any) {
    const { data, error } = await supabase
      .from('kvg_streams')
      .insert(stream)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateKvgStream(id: number, updates: any) {
    const { data, error } = await supabase
      .from('kvg_streams')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteKvgStream(id: number) {
    const { error } = await supabase
      .from('kvg_streams')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // File operations
  async uploadFile(file: Buffer, fileName: string, projectId: number, userId?: string) {
    const filePath = `project_${projectId}/${Date.now()}_${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('project-files')
      .upload(filePath, file);
    
    if (error) throw error;
    
    // Save file record in database
    const { data: fileRecord, error: dbError } = await supabase
      .from('project_files')
      .insert({
        project_id: projectId,
        filename: fileName,
        file_url: filePath,
        file_type: this.getFileType(fileName),
        file_size: file.length,
        uploaded_by: userId
      })
      .select()
      .single();
    
    if (dbError) throw dbError;
    
    return fileRecord;
  }

  async uploadImage(imageBuffer: Buffer, fileName: string, projectId: number, equipmentType?: string, equipmentId?: number, userId?: string) {
    const imagePath = `project_${projectId}/${equipmentType || 'general'}_${equipmentId || 'image'}_${Date.now()}_${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('project-images')
      .upload(imagePath, imageBuffer);
    
    if (error) throw error;
    
    // Save image record in database
    const { data: imageRecord, error: dbError } = await supabase
      .from('project_images')
      .insert({
        project_id: projectId,
        equipment_type: equipmentType,
        equipment_id: equipmentId,
        image_url: imagePath,
        filename: fileName,
        file_size: imageBuffer.length,
        uploaded_by: userId
      })
      .select()
      .single();
    
    if (dbError) throw dbError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('project-images')
      .getPublicUrl(imagePath);
    
    return { ...imageRecord, public_url: publicUrl };
  }

  async getProjectFiles(projectId: number) {
    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getProjectImages(projectId: number) {
    const { data, error } = await supabase
      .from('project_images')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Add public URLs
    return (data || []).map(image => {
      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(image.image_url);
      
      return { ...image, public_url: publicUrl };
    });
  }

  async deleteFile(fileId: number) {
    // Get file info first
    const { data: file, error: fetchError } = await supabase
      .from('project_files')
      .select('file_url')
      .eq('id', fileId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('project-files')
      .remove([file.file_url]);
    
    if (storageError) throw storageError;
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('project_files')
      .delete()
      .eq('id', fileId);
    
    if (dbError) throw dbError;
  }

  async deleteImage(imageId: number) {
    // Get image info first
    const { data: image, error: fetchError } = await supabase
      .from('project_images')
      .select('image_url')
      .eq('id', imageId)
      .single();
    
    if (fetchError) throw fetchError;
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('project-images')
      .remove([image.image_url]);
    
    if (storageError) throw storageError;
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('project_images')
      .delete()
      .eq('id', imageId);
    
    if (dbError) throw dbError;
  }

  private getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    const typeMap: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      txt: 'text/plain',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif'
    };
    
    return typeMap[extension || ''] || 'application/octet-stream';
  }
}

export const supabaseStorage = new SupabaseStorageService();
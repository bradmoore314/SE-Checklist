# Supabase Image Upload Setup Guide

## Required Setup Steps

Your image upload functionality is ready but requires a Supabase storage bucket to be created manually. Follow these steps:

### 1. Access Supabase Dashboard
- Go to your Supabase project dashboard
- Navigate to **Storage** → **Buckets**

### 2. Create Storage Bucket
- Click **"New bucket"**
- Name: `equipment-images`
- **Make it public**: ✅ Enable
- **File size limit**: 10 MB (10485760 bytes)
- **Allowed MIME types**: 
  - `image/png`
  - `image/jpeg` 
  - `image/jpg`
  - `image/gif`
  - `image/webp`

### 3. Set Storage Policies (if needed)
If you encounter permission issues, you may need to set up Row Level Security policies:

1. Go to **Authentication** → **Policies**
2. Look for **storage.objects** table
3. Create policies for:
   - **SELECT**: Allow public read access to equipment-images bucket
   - **INSERT**: Allow authenticated users to upload to equipment-images bucket

### 4. Test the Upload
Once the bucket is created:
1. Go to any camera in your project
2. Click the upload button (📤)
3. Select image files
4. The upload should work automatically

## What's Already Implemented

✅ **Database schema**: `equipment_images` table created  
✅ **API endpoints**: Upload, retrieve, and delete image endpoints  
✅ **Frontend components**: Image upload modal with progress tracking  
✅ **Image gallery**: View and manage uploaded images  
✅ **Error handling**: Clear error messages and validation  
✅ **File validation**: Size limits and MIME type checking  

## Current Status

The image upload system is fully functional and will work immediately once you create the `equipment-images` bucket in your Supabase dashboard. The system includes:

- **Multi-file upload** with progress tracking
- **Image gallery** with full-screen preview
- **Delete functionality** for managing images
- **Metadata storage** with file details
- **Error handling** with helpful messages

All camera equipment now has upload and gallery buttons that will connect to this system once the bucket is configured.
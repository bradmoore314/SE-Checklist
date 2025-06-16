/**
 * Script to create the equipment-images bucket in Supabase
 * Run this script once to set up the storage bucket for image uploads
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key needed for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createBucket() {
  try {
    console.log('Creating equipment-images bucket...');
    
    const { data, error } = await supabase.storage.createBucket('equipment-images', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    });

    if (error && error.message !== 'The resource already exists') {
      throw error;
    }

    console.log('✓ Equipment images bucket created successfully');
    
    // Set up storage policies for public access
    console.log('Setting up storage policies...');
    
    // Policy for public read access
    const { error: policyError1 } = await supabase.rpc('create_policy', {
      policy_name: 'Public Access',
      table_name: 'objects',
      definition: 'bucket_id = \'equipment-images\'',
      check: null,
      command: 'SELECT'
    });

    // Policy for authenticated upload
    const { error: policyError2 } = await supabase.rpc('create_policy', {
      policy_name: 'Authenticated Upload',
      table_name: 'objects', 
      definition: 'bucket_id = \'equipment-images\'',
      check: null,
      command: 'INSERT'
    });

    if (policyError1 || policyError2) {
      console.log('Note: Storage policies may need to be set up manually in Supabase dashboard');
    } else {
      console.log('✓ Storage policies configured');
    }

    console.log('\nBucket setup complete! You can now upload images to equipment.');
    
  } catch (error) {
    console.error('Error creating bucket:', error.message);
    console.log('\nManual Setup Instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Storage > Buckets');
    console.log('3. Create a new bucket named "equipment-images"');
    console.log('4. Set it as public');
    console.log('5. Set file size limit to 10MB');
    console.log('6. Add allowed MIME types: image/png, image/jpeg, image/jpg, image/gif, image/webp');
  }
}

createBucket();
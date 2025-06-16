-- Supabase database schema setup
-- This will create all the tables needed for your project management app

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Projects table
CREATE TABLE public.projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cameras table
CREATE TABLE public.cameras (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  camera_type TEXT NOT NULL,
  mounting_type TEXT,
  resolution TEXT,
  field_of_view TEXT,
  notes TEXT,
  is_indoor BOOLEAN,
  import_to_gateway BOOLEAN DEFAULT false,
  image_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Access Points table
CREATE TABLE public.access_points (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  access_point_type TEXT NOT NULL,
  mounting_type TEXT,
  power_source TEXT,
  network_connection TEXT,
  notes TEXT,
  import_to_gateway BOOLEAN DEFAULT false,
  image_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Elevators table
CREATE TABLE public.elevators (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  elevator_type TEXT NOT NULL,
  floors_served TEXT,
  capacity TEXT,
  notes TEXT,
  image_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Intercoms table
CREATE TABLE public.intercoms (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  intercom_type TEXT NOT NULL,
  mounting_type TEXT,
  power_source TEXT,
  notes TEXT,
  image_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KVG Streams table
CREATE TABLE public.kvg_streams (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stream_type TEXT,
  url TEXT,
  username TEXT,
  password TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Images table
CREATE TABLE public.project_images (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
  equipment_type TEXT,
  equipment_id INTEGER,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  filename TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Files table
CREATE TABLE public.project_files (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment Recommendations table
CREATE TABLE public.equipment_recommendations (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES public.projects(id) ON DELETE CASCADE,
  equipment_type TEXT NOT NULL,
  location TEXT NOT NULL,
  recommendation TEXT,
  confidence_score DECIMAL(3,2),
  status TEXT DEFAULT 'pending',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('project-files', 'project-files', true),
  ('project-images', 'project-images', true);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elevators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intercoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kvg_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_recommendations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Projects are viewable by authenticated users" ON public.projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert projects" ON public.projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own projects" ON public.projects
  FOR DELETE USING (auth.uid() = created_by);

-- Equipment policies (cameras, access_points, elevators, intercoms)
CREATE POLICY "Equipment is viewable by authenticated users" ON public.cameras
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert equipment" ON public.cameras
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update equipment" ON public.cameras
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete equipment" ON public.cameras
  FOR DELETE USING (auth.role() = 'authenticated');

-- Repeat for other equipment tables
CREATE POLICY "Access points viewable by authenticated users" ON public.access_points
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert access points" ON public.access_points
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update access points" ON public.access_points
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete access points" ON public.access_points
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Elevators viewable by authenticated users" ON public.elevators
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert elevators" ON public.elevators
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update elevators" ON public.elevators
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete elevators" ON public.elevators
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Intercoms viewable by authenticated users" ON public.intercoms
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert intercoms" ON public.intercoms
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update intercoms" ON public.intercoms
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete intercoms" ON public.intercoms
  FOR DELETE USING (auth.role() = 'authenticated');

-- KVG Streams policies
CREATE POLICY "KVG streams viewable by authenticated users" ON public.kvg_streams
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert KVG streams" ON public.kvg_streams
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update KVG streams" ON public.kvg_streams
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete KVG streams" ON public.kvg_streams
  FOR DELETE USING (auth.role() = 'authenticated');

-- File and image policies
CREATE POLICY "Project files viewable by authenticated users" ON public.project_files
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert project files" ON public.project_files
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Project images viewable by authenticated users" ON public.project_images
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert project images" ON public.project_images
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Equipment recommendations policies
CREATE POLICY "Recommendations viewable by authenticated users" ON public.equipment_recommendations
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert recommendations" ON public.equipment_recommendations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update recommendations" ON public.equipment_recommendations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Storage policies
CREATE POLICY "Project files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-files');

CREATE POLICY "Authenticated users can upload project files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-files' AND auth.role() = 'authenticated');

CREATE POLICY "Project images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'project-images');

CREATE POLICY "Authenticated users can upload project images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'project-images' AND auth.role() = 'authenticated');

-- Create functions for automatic timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_cameras_updated_at
  BEFORE UPDATE ON public.cameras
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_access_points_updated_at
  BEFORE UPDATE ON public.access_points
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_elevators_updated_at
  BEFORE UPDATE ON public.elevators
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_intercoms_updated_at
  BEFORE UPDATE ON public.intercoms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_kvg_streams_updated_at
  BEFORE UPDATE ON public.kvg_streams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
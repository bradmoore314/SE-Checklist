# Complete Security Project Management Application Specification

## Table of Contents
1. [Application Overview](#application-overview)
2. [Core Technologies](#core-technologies)
3. [Database Schema](#database-schema)
4. [Equipment Management System](#equipment-management-system)
5. [KVG Data Collection System](#kvg-data-collection-system)
6. [Floorplan Management System](#floorplan-management-system)
7. [AI Integration System](#ai-integration-system)
8. [User Interface Requirements](#user-interface-requirements)
9. [Authentication & Security](#authentication--security)
10. [Mobile Optimization](#mobile-optimization)
11. [Reporting System](#reporting-system)
12. [Integration Points](#integration-points)

## Application Overview

Create a comprehensive security project management web application for Kastle Systems, a leading provider of security solutions. This application manages security equipment installations, floorplan analysis, AI-powered assessments, and KVG (Kastle Video Guarding) service quoting across the complete project lifecycle.

### Key Business Requirements
- **Multi-stakeholder workflow**: Different users (BDM, Sales Engineer, Account Manager, Field Technician) complete different parts of the system
- **Equipment-centric design**: Support for hundreds of equipment items per project with detailed specifications
- **Visual integration**: Seamless floorplan-to-equipment linking with interactive markers
- **AI-powered analysis**: Intelligent recommendations and assessments using Azure OpenAI
- **Professional deliverables**: Client-ready reports and proposals
- **Mobile-first field work**: Optimized for tablets and mobile devices used by field technicians

## Core Technologies

### Frontend Stack
- **React.js 18+** with TypeScript for type safety
- **shadcn/ui** component library for consistent design
- **TailwindCSS** for responsive styling
- **Wouter** for client-side routing
- **@tanstack/react-query** for server state management
- **React Hook Form** with Zod validation
- **PDF.js** for floorplan rendering and annotation
- **Lucide React** for consistent iconography

### Backend Stack
- **Express.js** with TypeScript
- **PostgreSQL** with spatial data extensions
- **Drizzle ORM** for type-safe database operations
- **Azure OpenAI SDK** for AI integration
- **Passport.js** with Azure AD for authentication
- **Express Session** with PostgreSQL session store
- **Sharp** for image processing
- **jsPDF** for report generation

### Development Tools
- **Vite** for fast development and building
- **ESLint** and **Prettier** for code quality
- **TypeScript** for type safety across the stack
- **Drizzle Kit** for database migrations

## Database Schema

### Core Tables

#### Projects Table
```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  client_name VARCHAR(100) NOT NULL,
  client_id INTEGER REFERENCES clients(id),
  address VARCHAR(200) NOT NULL,
  city VARCHAR(50) NOT NULL,
  state VARCHAR(2) NOT NULL CHECK (state IN ('AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC')),
  zip_code VARCHAR(10) NOT NULL,
  country VARCHAR(50) DEFAULT 'United States',
  status VARCHAR(20) NOT NULL CHECK (status IN ('Planning','Active','On Hold','Complete','Archived')),
  start_date DATE NOT NULL,
  target_completion DATE NOT NULL,
  actual_completion DATE,
  project_manager VARCHAR(100) NOT NULL,
  project_type VARCHAR(20) NOT NULL CHECK (project_type IN ('New Construction','Renovation','Upgrade','Assessment','Maintenance')),
  square_footage INTEGER,
  number_of_floors INTEGER,
  building_type VARCHAR(20) NOT NULL CHECK (building_type IN ('Office','Residential','Mixed-Use','Retail','Industrial','Healthcare','Education','Government','Other')),
  occupancy_type VARCHAR(20) NOT NULL CHECK (occupancy_type IN ('24/7','Business Hours','Multi-Shift','Variable')),
  security_level VARCHAR(20) NOT NULL CHECK (security_level IN ('Basic','Enhanced','High','Government/Regulated')),
  budget_total DECIMAL(12,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Access Points Table
```sql
CREATE TABLE access_points (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Door','Gate','Barrier','Manhole','Hatch')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('Planned','Installed','Needs Replacement','Decommissioned')),
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  floor VARCHAR(50) NOT NULL,
  reader_type VARCHAR(30) NOT NULL CHECK (reader_type IN ('Proximity','Smart Card','Biometric','Multi-Technology','Mobile Credential')),
  reader_model VARCHAR(100),
  mounting_height DECIMAL(5,2),
  controller_type VARCHAR(30) NOT NULL CHECK (controller_type IN ('Kastle KMS','Kastle K1','Lenel','S2','Software House','Other')),
  controller_address VARCHAR(50),
  panel_connection VARCHAR(20) NOT NULL CHECK (panel_connection IN ('Direct','IO Module','Wireless')),
  door_position_switch BOOLEAN DEFAULT FALSE,
  rex_type VARCHAR(20) NOT NULL CHECK (rex_type IN ('Motion','Push Button','Crash Bar','None')),
  lock_type VARCHAR(30) NOT NULL CHECK (lock_type IN ('Magnetic','Electric Strike','Electrified Panic','Electrified Mortise','Electric Bolt','Other')),
  emergency_access VARCHAR(30) NOT NULL CHECK (emergency_access IN ('Key Override','Firefighter Access','None')),
  area_from VARCHAR(100),
  area_to VARCHAR(100),
  tailgate_detection BOOLEAN DEFAULT FALSE,
  security_level VARCHAR(20) NOT NULL CHECK (security_level IN ('Perimeter','Internal','High-Security','Critical')),
  power_source VARCHAR(30) NOT NULL CHECK (power_source IN ('Local Power Supply','PoE','Controller Powered','Other')),
  backup_power BOOLEAN DEFAULT FALSE,
  scheduled_unlock BOOLEAN DEFAULT FALSE,
  alarm_shunt BOOLEAN DEFAULT FALSE,
  hardware_vendor VARCHAR(100),
  maintenance_date DATE,
  maintenance_due DATE,
  notes TEXT,
  resolved_from_ui BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Cameras Table
```sql
CREATE TABLE cameras (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Fixed','PTZ','Multi-Sensor','Fisheye','Specialty')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('Planned','Installed','Needs Replacement','Decommissioned')),
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  floor VARCHAR(50) NOT NULL,
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  resolution VARCHAR(20) NOT NULL CHECK (resolution IN ('SD','HD','Full HD','4K','5MP','8MP','12MP','Other')),
  lens_type VARCHAR(20) NOT NULL CHECK (lens_type IN ('Fixed','Varifocal','Zoom','Fisheye')),
  lens_focal_length VARCHAR(20),
  mounting_type VARCHAR(20) NOT NULL CHECK (mounting_type IN ('Ceiling','Wall','Pole','Corner','Pendant','Recessed')),
  mounting_height DECIMAL(5,2),
  indoor_outdoor VARCHAR(20) NOT NULL CHECK (indoor_outdoor IN ('Indoor','Outdoor','Indoor/Outdoor')),
  ip_rating VARCHAR(10),
  vandal_resistant BOOLEAN DEFAULT FALSE,
  day_night BOOLEAN DEFAULT FALSE,
  ir_illumination BOOLEAN DEFAULT FALSE,
  ir_distance INTEGER,
  power_type VARCHAR(20) NOT NULL CHECK (power_type IN ('PoE','12VDC','24VAC','PoE+','Other')),
  poe_type VARCHAR(20) CHECK (poe_type IN ('802.3af','802.3at','802.3bt','Passive','N/A')),
  storage_type VARCHAR(20) NOT NULL CHECK (storage_type IN ('NVR','Cloud','Edge','Hybrid')),
  retention_days INTEGER DEFAULT 30,
  analytics VARCHAR(100) CHECK (analytics IN ('Motion Detection','Line Crossing','Object Classification','Face Detection','LPR','Multiple','None')),
  onvif_compliant BOOLEAN DEFAULT TRUE,
  network_address VARCHAR(50),
  viewing_angle_h DECIMAL(5,2),
  viewing_angle_v DECIMAL(5,2),
  recording_fps INTEGER DEFAULT 30,
  min_illumination VARCHAR(20),
  dynamic_range VARCHAR(20),
  audio BOOLEAN DEFAULT FALSE,
  audio_type VARCHAR(20) CHECK (audio_type IN ('One-way','Two-way','None')),
  maintenance_date DATE,
  notes TEXT,
  resolved_from_ui BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Elevators Table
```sql
CREATE TABLE elevators (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Planned','Installed','Needs Replacement','Decommissioned')),
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  elevator_bank VARCHAR(50),
  type VARCHAR(20) NOT NULL CHECK (type IN ('Passenger','Service','Freight','Shuttle')),
  floors_served VARCHAR(100),
  access_control_type VARCHAR(30) NOT NULL CHECK (access_control_type IN ('Card Reader','Destination Dispatch','Key Switch','None')),
  reader_location VARCHAR(20) CHECK (reader_location IN ('Cab','Hall Call','Both','None')),
  reader_type VARCHAR(30) CHECK (reader_type IN ('Proximity','Smart Card','Biometric','Multi-Technology','Mobile Credential')),
  controller_type VARCHAR(30) CHECK (controller_type IN ('Kastle KMS','Kastle K1','Elevator Manufacturer','Other')),
  fire_service BOOLEAN DEFAULT FALSE,
  emergency_power BOOLEAN DEFAULT FALSE,
  camera_present BOOLEAN DEFAULT FALSE,
  camera_id INTEGER REFERENCES cameras(id),
  intercom_present BOOLEAN DEFAULT FALSE,
  maintenance_company VARCHAR(100),
  maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Turnstiles Table
```sql
CREATE TABLE turnstiles (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Planned','Installed','Needs Replacement','Decommissioned')),
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  floor VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('Optical','Tripod','Full-Height','Swing Gate','Speed Gate')),
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  lane_width DECIMAL(5,2),
  throughput_rate INTEGER,
  tailgating_detection BOOLEAN DEFAULT FALSE,
  reader_type VARCHAR(30) CHECK (reader_type IN ('Proximity','Smart Card','Biometric','Multi-Technology','Mobile Credential')),
  reader_location VARCHAR(20) CHECK (reader_location IN ('Entry Side','Exit Side','Both Sides')),
  bidirectional BOOLEAN DEFAULT FALSE,
  ada_compliant BOOLEAN DEFAULT FALSE,
  ada_gate_present BOOLEAN DEFAULT FALSE,
  emergency_egress VARCHAR(30) NOT NULL CHECK (emergency_egress IN ('Fail Safe','Battery Backup','Mechanical Release')),
  cabinet_material VARCHAR(30) CHECK (cabinet_material IN ('Stainless Steel','Powder Coated','Glass','Custom')),
  barrier_type VARCHAR(30) CHECK (barrier_type IN ('Swing','Retractable','Drop Arm','Glass Panels','None')),
  barrier_height DECIMAL(5,2),
  power_requirements VARCHAR(100),
  maintenance_company VARCHAR(100),
  maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Intrusion Detection Table
```sql
CREATE TABLE intrusion_detection (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Planned','Installed','Needs Replacement','Decommissioned')),
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  floor VARCHAR(50) NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('Motion Detector','Glass Break','Door Contact','Duress Button','Other')),
  model VARCHAR(100),
  zone VARCHAR(50),
  panel_type VARCHAR(30) NOT NULL CHECK (panel_type IN ('Kastle KMS','Kastle K1','DSC','Honeywell','Bosch','Other')),
  panel_connection VARCHAR(20) NOT NULL CHECK (panel_connection IN ('Hardwired','Wireless','Hybrid')),
  zone_24hr BOOLEAN DEFAULT FALSE,
  entry_exit BOOLEAN DEFAULT FALSE,
  mounting_height DECIMAL(5,2),
  coverage_area DECIMAL(8,2),
  sensitivity_adjustable BOOLEAN DEFAULT FALSE,
  pet_immune BOOLEAN DEFAULT FALSE,
  tamper_protection BOOLEAN DEFAULT FALSE,
  power_source VARCHAR(20) NOT NULL CHECK (power_source IN ('Panel','Local','Battery')),
  maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Emergency Communication Table
```sql
CREATE TABLE emergency_communication (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Planned','Installed','Needs Replacement','Decommissioned')),
  name VARCHAR(100) NOT NULL,
  location VARCHAR(200) NOT NULL,
  floor VARCHAR(50) NOT NULL,
  type VARCHAR(30) NOT NULL CHECK (type IN ('Emergency Phone','Intercom','Call Box','Mass Notification','Duress Button')),
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  mounting_type VARCHAR(20) NOT NULL CHECK (mounting_type IN ('Wall','Pedestal','Recessed','Desk','Other')),
  ada_compliant BOOLEAN DEFAULT FALSE,
  audio_visual VARCHAR(20) NOT NULL CHECK (audio_visual IN ('Audio Only','Visual Only','Both')),
  connection_type VARCHAR(20) NOT NULL CHECK (connection_type IN ('Analog','VoIP','Cellular','Radio')),
  monitoring_type VARCHAR(30) NOT NULL CHECK (monitoring_type IN ('On-site','Central Station','Local Emergency Services','KVG')),
  backup_power BOOLEAN DEFAULT FALSE,
  maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### KVG System Tables

#### KVG Discovery Data Table
```sql
CREATE TABLE kvg_discovery_data (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  -- Client Information
  client_name VARCHAR(100) NOT NULL,
  client_industry VARCHAR(30) NOT NULL CHECK (client_industry IN ('Retail','Commercial Office','Healthcare','Education','Government','Industrial','Multifamily','Banking/Financial','Other')),
  client_address VARCHAR(200) NOT NULL,
  client_city VARCHAR(50) NOT NULL,
  client_state VARCHAR(2) NOT NULL,
  client_zip VARCHAR(10) NOT NULL,
  primary_contact_name VARCHAR(100) NOT NULL,
  primary_contact_title VARCHAR(100) NOT NULL,
  primary_contact_phone VARCHAR(20) NOT NULL,
  primary_contact_email VARCHAR(100) NOT NULL,
  existing_kastle_client VARCHAR(10) NOT NULL CHECK (existing_kastle_client IN ('Yes','No','Former')),
  -- Opportunity Information
  opportunity_name VARCHAR(100) NOT NULL,
  opportunity_stage VARCHAR(30) NOT NULL CHECK (opportunity_stage IN ('Qualification','Needs Analysis','Proposal','Negotiation','Closed Won','Closed Lost')),
  expected_close_date DATE NOT NULL,
  opportunity_value_annual DECIMAL(12,2),
  competing_solutions TEXT,
  -- Site Information
  property_type VARCHAR(30) NOT NULL CHECK (property_type IN ('Office Building','Retail Location','Warehouse/Industrial','Healthcare Facility','Educational','Government','Mixed-Use','Other')),
  total_square_footage INTEGER NOT NULL,
  number_of_buildings INTEGER NOT NULL,
  number_of_floors INTEGER NOT NULL,
  number_of_entrances INTEGER NOT NULL,
  parking_type TEXT,
  -- Security Assessment
  current_security_measures TEXT,
  current_issues TEXT NOT NULL,
  primary_security_concern VARCHAR(30) NOT NULL CHECK (primary_security_concern IN ('Theft','Vandalism','Trespassing','Employee Safety','Customer Safety','Regulatory Compliance','Liability Reduction','Other')),
  kvg_interest_reason TEXT NOT NULL,
  decision_timeline VARCHAR(30) NOT NULL CHECK (decision_timeline IN ('Immediate (0-30 days)','Short-term (30-90 days)','Medium-term (3-6 months)','Long-term (6+ months)')),
  budget_range VARCHAR(20) CHECK (budget_range IN ('Less than $10k','$10k-$25k','$25k-$50k','$50k-$100k','$100k+','Unknown')),
  decision_maker VARCHAR(100) NOT NULL,
  decision_process TEXT NOT NULL,
  completed_by VARCHAR(100),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### KVG Technical Assessment Table
```sql
CREATE TABLE kvg_technical_assessment (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  -- Current Camera System
  existing_camera_system VARCHAR(10) NOT NULL CHECK (existing_camera_system IN ('Yes','No','Partial')),
  camera_manufacturer TEXT,
  camera_age VARCHAR(20) CHECK (camera_age IN ('<1 year','1-3 years','3-5 years','5+ years','Unknown')),
  -- Camera Inventory
  total_fixed_indoor_cameras INTEGER NOT NULL DEFAULT 0,
  total_fixed_outdoor_cameras INTEGER NOT NULL DEFAULT 0,
  total_ptz_cameras INTEGER NOT NULL DEFAULT 0,
  total_dual_lens_cameras INTEGER NOT NULL DEFAULT 0,
  total_quad_lens_cameras INTEGER NOT NULL DEFAULT 0,
  total_specialty_cameras INTEGER DEFAULT 0,
  specialty_camera_types TEXT,
  -- Camera Specifications
  typical_camera_resolution VARCHAR(20) NOT NULL CHECK (typical_camera_resolution IN ('SD','HD (720p)','Full HD (1080p)','4K','Mixed','Unknown')),
  camera_connection_type VARCHAR(20) NOT NULL CHECK (camera_connection_type IN ('IP/Network','Analog','Hybrid','Unknown')),
  -- Current VMS/Recording System
  current_vms_system VARCHAR(10) NOT NULL CHECK (current_vms_system IN ('Yes','No')),
  vms_manufacturer VARCHAR(20) CHECK (vms_manufacturer IN ('Genetec','Milestone','Avigilon','Exacq','Valerus','Other','Unknown')),
  current_recording_duration VARCHAR(20) CHECK (current_recording_duration IN ('<7 days','7-14 days','15-30 days','30+ days','Unknown')),
  -- Network Infrastructure
  internet_connection_type VARCHAR(20) NOT NULL CHECK (internet_connection_type IN ('Fiber','Cable','DSL','T1/T3','5G/Cellular','Other','Unknown')),
  download_speed VARCHAR(20) NOT NULL CHECK (download_speed IN ('<25Mbps','25-100Mbps','100-500Mbps','500Mbps-1Gbps','1Gbps+','Unknown')),
  upload_speed VARCHAR(20) NOT NULL CHECK (upload_speed IN ('<10Mbps','10-25Mbps','25-100Mbps','100Mbps+','Unknown')),
  network_managed_by VARCHAR(20) NOT NULL CHECK (network_managed_by IN ('Internal IT','MSP','Not Managed','Unknown')),
  firewall_present VARCHAR(10) NOT NULL CHECK (firewall_present IN ('Yes','No','Unknown')),
  available_network_ports VARCHAR(20) NOT NULL CHECK (available_network_ports IN ('Yes','No','Unknown','Requires Assessment')),
  poe_availability VARCHAR(20) NOT NULL CHECK (poe_availability IN ('Full','Partial','None','Unknown')),
  -- Calculated Fields
  estimated_stream_count INTEGER GENERATED ALWAYS AS (
    total_fixed_indoor_cameras + total_fixed_outdoor_cameras + total_ptz_cameras + 
    (total_dual_lens_cameras * 2) + (total_quad_lens_cameras * 4) + total_specialty_cameras
  ) STORED,
  standard_gateway_recommendation INTEGER GENERATED ALWAYS AS (
    CEIL((total_fixed_indoor_cameras + total_fixed_outdoor_cameras + total_ptz_cameras + 
    (total_dual_lens_cameras * 2) + (total_quad_lens_cameras * 4) + total_specialty_cameras)::DECIMAL / 16)
  ) STORED,
  high_capacity_gateway_recommendation INTEGER GENERATED ALWAYS AS (
    CEIL((total_fixed_indoor_cameras + total_fixed_outdoor_cameras + total_ptz_cameras + 
    (total_dual_lens_cameras * 2) + (total_quad_lens_cameras * 4) + total_specialty_cameras)::DECIMAL / 32)
  ) STORED,
  completed_by VARCHAR(100),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### KVG Voice of Customer Table
```sql
CREATE TABLE kvg_voice_of_customer (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  -- Monitoring Requirements
  monitoring_schedule_type VARCHAR(20) NOT NULL CHECK (monitoring_schedule_type IN ('24/7','After-Hours Only','Business Hours Only','Custom Schedule')),
  business_hours_start TIME,
  business_hours_end TIME,
  business_days TEXT,
  weekend_monitoring BOOLEAN DEFAULT FALSE,
  holiday_monitoring BOOLEAN NOT NULL,
  special_event_monitoring BOOLEAN NOT NULL,
  custom_schedule_details TEXT,
  -- Alert Configuration
  primary_alert_triggers TEXT,
  alert_priority_areas TEXT,
  specific_alert_instructions TEXT,
  permitted_hours_operation TEXT NOT NULL,
  -- Response Protocol
  authorized_response_actions TEXT NOT NULL,
  primary_contact_sequence JSONB NOT NULL,
  escalation_time VARCHAR(10) NOT NULL CHECK (escalation_time IN ('5 min','10 min','15 min','30 min','60 min')),
  police_dispatch_authorization VARCHAR(30) NOT NULL CHECK (police_dispatch_authorization IN ('Yes - Any Time','Yes - After Contact Attempts','No')),
  guard_dispatch_authorization VARCHAR(30) NOT NULL CHECK (guard_dispatch_authorization IN ('Yes - Any Time','Yes - After Contact Attempts','No','N/A')),
  -- Compliance & Reporting
  industry_compliance_requirements TEXT,
  video_retention_requirement VARCHAR(20) NOT NULL CHECK (video_retention_requirement IN ('7 days','14 days','30 days','60 days','90 days','Custom')),
  custom_retention_period INTEGER,
  regular_report_requirements TEXT,
  custom_report_requirements TEXT,
  completed_by VARCHAR(100),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### KVG Site Assessment Table
```sql
CREATE TABLE kvg_site_assessment (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  -- Site Visit Information
  site_visit_date DATE NOT NULL,
  site_visit_conducted_by VARCHAR(100) NOT NULL,
  site_contact_name VARCHAR(100) NOT NULL,
  site_contact_title VARCHAR(100) NOT NULL,
  site_contact_phone VARCHAR(20) NOT NULL,
  -- Camera Placement Verification
  verified_indoor_camera_count INTEGER NOT NULL,
  verified_outdoor_camera_count INTEGER NOT NULL,
  camera_location_documentation JSONB, -- Array of file references
  camera_position_changes_required BOOLEAN NOT NULL,
  camera_position_change_details TEXT,
  -- Infrastructure Assessment
  cable_pathways_verified VARCHAR(10) NOT NULL CHECK (cable_pathways_verified IN ('Yes','No','Partial')),
  cable_path_issues TEXT,
  network_access_points_confirmed VARCHAR(10) NOT NULL CHECK (network_access_points_confirmed IN ('Yes','No','Partial')),
  network_access_issues TEXT,
  power_availability_confirmed VARCHAR(10) NOT NULL CHECK (power_availability_confirmed IN ('Yes','No','Partial')),
  power_issues TEXT,
  -- Gateway Installation
  recommended_gateway_locations TEXT NOT NULL,
  gateway_location_photos JSONB, -- Array of file references
  network_connectivity_at_gateway_locations VARCHAR(10) NOT NULL CHECK (network_connectivity_at_gateway_locations IN ('Good','Fair','Poor','None')),
  gateway_location_issues TEXT,
  -- Installation Requirements
  access_restrictions TEXT NOT NULL,
  work_hour_restrictions TEXT NOT NULL,
  special_equipment_needed BOOLEAN NOT NULL,
  special_equipment_details TEXT,
  permits_required VARCHAR(10) NOT NULL CHECK (permits_required IN ('Yes','No','Unknown')),
  permit_details TEXT,
  -- Assessment Summary
  feasibility_assessment VARCHAR(40) NOT NULL CHECK (feasibility_assessment IN ('Fully Feasible','Mostly Feasible with Minor Issues','Feasible with Significant Issues','Not Feasible')),
  critical_issues TEXT,
  estimated_installation_time VARCHAR(20) NOT NULL CHECK (estimated_installation_time IN ('<1 day','1-2 days','3-5 days','1-2 weeks','2+ weeks')),
  recommended_next_steps TEXT NOT NULL,
  additional_notes TEXT,
  site_photos JSONB, -- Array of file references
  completed_by VARCHAR(100),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### KVG Gateway Calculator Table
```sql
CREATE TABLE kvg_gateway_calculator (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  -- Camera Input
  fixed_single_lens_indoor INTEGER NOT NULL DEFAULT 0,
  fixed_single_lens_outdoor INTEGER NOT NULL DEFAULT 0,
  ptz_cameras INTEGER NOT NULL DEFAULT 0,
  dual_lens_cameras INTEGER NOT NULL DEFAULT 0,
  quad_lens_cameras INTEGER NOT NULL DEFAULT 0,
  -- Resolution Settings
  sd_cameras INTEGER DEFAULT 0,
  hd_cameras INTEGER DEFAULT 0,
  four_k_cameras INTEGER DEFAULT 0,
  -- Calculated Fields
  total_camera_count INTEGER GENERATED ALWAYS AS (
    fixed_single_lens_indoor + fixed_single_lens_outdoor + ptz_cameras + dual_lens_cameras + quad_lens_cameras
  ) STORED,
  total_stream_count INTEGER GENERATED ALWAYS AS (
    fixed_single_lens_indoor + fixed_single_lens_outdoor + ptz_cameras + (dual_lens_cameras * 2) + (quad_lens_cameras * 4)
  ) STORED,
  resolution_factor DECIMAL(3,2) GENERATED ALWAYS AS (
    CASE 
      WHEN (sd_cameras + hd_cameras + four_k_cameras) = 0 THEN 1.0
      ELSE ((sd_cameras * 0.5) + (hd_cameras * 1.0) + (four_k_cameras * 2.0)) / (sd_cameras + hd_cameras + four_k_cameras)
    END
  ) STORED,
  adjusted_stream_count INTEGER GENERATED ALWAYS AS (
    CEIL((fixed_single_lens_indoor + fixed_single_lens_outdoor + ptz_cameras + (dual_lens_cameras * 2) + (quad_lens_cameras * 4)) * 
    CASE 
      WHEN (sd_cameras + hd_cameras + four_k_cameras) = 0 THEN 1.0
      ELSE ((sd_cameras * 0.5) + (hd_cameras * 1.0) + (four_k_cameras * 2.0)) / (sd_cameras + hd_cameras + four_k_cameras)
    END)
  ) STORED,
  standard_gateway_count INTEGER GENERATED ALWAYS AS (
    CEIL((fixed_single_lens_indoor + fixed_single_lens_outdoor + ptz_cameras + (dual_lens_cameras * 2) + (quad_lens_cameras * 4)) * 
    CASE 
      WHEN (sd_cameras + hd_cameras + four_k_cameras) = 0 THEN 1.0
      ELSE ((sd_cameras * 0.5) + (hd_cameras * 1.0) + (four_k_cameras * 2.0)) / (sd_cameras + hd_cameras + four_k_cameras)
    END / 16.0)
  ) STORED,
  high_capacity_gateway_count INTEGER GENERATED ALWAYS AS (
    CEIL((fixed_single_lens_indoor + fixed_single_lens_outdoor + ptz_cameras + (dual_lens_cameras * 2) + (quad_lens_cameras * 4)) * 
    CASE 
      WHEN (sd_cameras + hd_cameras + four_k_cameras) = 0 THEN 1.0
      ELSE ((sd_cameras * 0.5) + (hd_cameras * 1.0) + (four_k_cameras * 2.0)) / (sd_cameras + hd_cameras + four_k_cameras)
    END / 32.0)
  ) STORED,
  -- Redundancy Options
  redundancy_type VARCHAR(10) CHECK (redundancy_type IN ('None','N+1','N+2','2N')),
  total_gateways_with_redundancy INTEGER,
  -- Bandwidth Estimation (in Mbps)
  estimated_total_bandwidth DECIMAL(8,2) GENERATED ALWAYS AS (
    (fixed_single_lens_indoor + fixed_single_lens_outdoor + ptz_cameras + (dual_lens_cameras * 2) + (quad_lens_cameras * 4)) * 
    CASE 
      WHEN (sd_cameras + hd_cameras + four_k_cameras) = 0 THEN 2.0 -- Default 2 Mbps per stream
      ELSE ((sd_cameras * 1.0) + (hd_cameras * 2.0) + (four_k_cameras * 8.0)) / (sd_cameras + hd_cameras + four_k_cameras)
    END
  ) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Floorplan System Tables

#### Floorplans Table
```sql
CREATE TABLE floorplans (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  pdf_data TEXT NOT NULL, -- Base64 encoded PDF
  page_count INTEGER NOT NULL,
  is_satellite_image BOOLEAN DEFAULT FALSE,
  content_type VARCHAR(50) DEFAULT 'application/pdf',
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Floorplan Layers Table
```sql
CREATE TABLE floorplan_layers (
  id SERIAL PRIMARY KEY,
  floorplan_id INTEGER NOT NULL REFERENCES floorplans(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  color VARCHAR(10) NOT NULL DEFAULT '#0000FF',
  visible BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Floorplan Markers Table
```sql
CREATE TABLE floorplan_markers (
  id SERIAL PRIMARY KEY,
  floorplan_id INTEGER NOT NULL REFERENCES floorplans(id) ON DELETE CASCADE,
  unique_id VARCHAR(50) NOT NULL,
  page INTEGER NOT NULL,
  marker_type VARCHAR(30) NOT NULL CHECK (marker_type IN ('camera','access_point','elevator','turnstile','intrusion_detection','emergency_communication','misc_equipment')),
  equipment_id INTEGER, -- References various equipment tables based on marker_type
  layer_id INTEGER REFERENCES floorplan_layers(id),
  position_x DECIMAL(10,6) NOT NULL,
  position_y DECIMAL(10,6) NOT NULL,
  end_x DECIMAL(10,6),
  end_y DECIMAL(10,6),
  width DECIMAL(8,4),
  height DECIMAL(8,4),
  rotation DECIMAL(6,2) DEFAULT 0,
  color VARCHAR(10),
  fill_color VARCHAR(10),
  opacity DECIMAL(3,2) DEFAULT 1.0,
  line_width DECIMAL(4,2) DEFAULT 1.0,
  label VARCHAR(100),
  text_content TEXT,
  font_size DECIMAL(4,1) DEFAULT 12,
  font_family VARCHAR(50) DEFAULT 'Arial',
  points JSONB, -- For polygon/polyline markers
  author_id INTEGER REFERENCES users(id),
  author_name VARCHAR(100),
  version INTEGER DEFAULT 1,
  parent_id INTEGER REFERENCES floorplan_markers(id),
  fov DECIMAL(5,2), -- Camera field of view in degrees
  range DECIMAL(8,2), -- Camera range in feet/meters
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(floorplan_id, unique_id)
);
```

### User Management Tables

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  azure_id VARCHAR(100) UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('Admin','BDM','Sales Engineer','Account Manager','Field Technician','Viewer')),
  department VARCHAR(50),
  phone VARCHAR(20),
  active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### User Sessions Table
```sql
CREATE TABLE user_sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
```

## Equipment Management System

### Access Control Equipment

#### Access Points Form Fields
Create a comprehensive form with the following sections:

**Basic Information Section:**
- Name (Text, Required, Auto-suggest from naming conventions)
- Type (Dropdown, Required: Door, Gate, Barrier, Manhole, Hatch)
- Status (Dropdown, Required: Planned, Installed, Needs Replacement, Decommissioned)
- Location (Text, Required, Auto-suggest from previous entries)
- Floor (Dropdown, Required, populated from building floor data)

**Reader Configuration Section:**
- Reader Type (Dropdown, Required: Proximity, Smart Card, Biometric, Multi-Technology, Mobile Credential)
- Reader Model (Text, Optional, Auto-suggest based on type)
- Mounting Height (Number with unit selector: feet/inches/meters)

**Controller & Panel Section:**
- Controller Type (Dropdown, Required: Kastle KMS, Kastle K1, Lenel, S2, Software House, Other)
- Controller Address (Text, Format validation for IP addresses)
- Panel Connection (Dropdown, Required: Direct, IO Module, Wireless)

**Hardware Configuration Section:**
- Door Position Switch (Toggle, Default: OFF)
- REX Type (Dropdown, Required: Motion, Push Button, Crash Bar, None)
- Lock Type (Dropdown, Required: Magnetic, Electric Strike, Electrified Panic, Electrified Mortise, Electric Bolt, Other)

**Security Settings Section:**
- Emergency Access (Dropdown, Required: Key Override, Firefighter Access, None)
- Area From/To (Text, Optional, for transition tracking)
- Tailgate Detection (Toggle, Default: OFF)
- Security Level (Dropdown, Required: Perimeter, Internal, High-Security, Critical)

**Power & Infrastructure Section:**
- Power Source (Dropdown, Required: Local Power Supply, PoE, Controller Powered, Other)
- Backup Power (Toggle, Default: OFF)
- Scheduled Unlock (Toggle, Default: OFF)
- Alarm Shunt (Toggle, Default: OFF)

**Maintenance Section:**
- Hardware Vendor (Text, Optional)
- Last Maintenance Date (Date picker)
- Next Maintenance Due (Date picker, Auto-calculate based on vendor recommendations)

**Notes Section:**
- Notes (Rich text editor for detailed information)

#### Form Behavior and Validation:
- **Real-time validation**: Check field formats and required fields as user types
- **Conditional fields**: Show/hide fields based on selections (e.g., Controller Address only for network-connected controllers)
- **Auto-suggestions**: Populate dropdown options based on project history and industry standards
- **Bulk operations**: Allow copying configurations to multiple access points
- **Integration sync**: Auto-update related floorplan markers when equipment is modified

### Camera Equipment

#### Camera Form Fields
Create a detailed camera configuration form with these sections:

**Basic Camera Information:**
- Name (Text, Required, with auto-numbering option)
- Type (Dropdown, Required: Fixed, PTZ, Multi-Sensor, Fisheye, Specialty)
- Status (Dropdown, Required: Planned, Installed, Needs Replacement, Decommissioned)
- Location (Text, Required, with GPS coordinate option)
- Floor (Dropdown, Required)

**Technical Specifications:**
- Manufacturer (Dropdown with search: Axis, Hanwha, Bosch, Avigilon, Hikvision, Dahua, Panasonic, Other)
- Model (Text with manufacturer-specific auto-suggestions)
- Resolution (Dropdown, Required: SD, HD, Full HD, 4K, 5MP, 8MP, 12MP, Other)
- Lens Type (Dropdown, Required: Fixed, Varifocal, Zoom, Fisheye)
- Lens Focal Length (Text with format validation: e.g., "2.8mm" or "3.6-11mm")

**Installation Details:**
- Mounting Type (Dropdown, Required: Ceiling, Wall, Pole, Corner, Pendant, Recessed)
- Mounting Height (Number with unit selector: feet/meters)
- Indoor/Outdoor (Dropdown, Required: Indoor, Outdoor, Indoor/Outdoor)
- IP Rating (Text with validation: IP65, IP67, etc.)
- Vandal Resistant (Toggle)

**Imaging Capabilities:**
- Day/Night Capability (Toggle)
- IR Illumination (Toggle)
- IR Distance (Number with unit selector, shown only if IR enabled)
- Minimum Illumination (Text: e.g., "0.01 lux")
- Dynamic Range (Text: e.g., "120dB WDR")

**Power and Network:**
- Power Type (Dropdown, Required: PoE, 12VDC, 24VAC, PoE+, Other)
- PoE Type (Dropdown: 802.3af, 802.3at, 802.3bt, Passive, N/A)
- ONVIF Compliant (Toggle, Default: ON)
- Network Address (Text with IP validation)

**Video Configuration:**
- Storage Type (Dropdown, Required: NVR, Cloud, Edge, Hybrid)
- Retention Days (Number, Default: 30)
- Recording FPS (Number, Default: 30, Range: 1-60)
- Viewing Angle Horizontal (Number in degrees)
- Viewing Angle Vertical (Number in degrees)

**Analytics and Features:**
- Analytics Enabled (Multi-select: Motion Detection, Line Crossing, Object Classification, Face Detection, LPR, None)
- Audio Capability (Dropdown: None, One-way, Two-way)

**Maintenance Tracking:**
- Last Maintenance Date (Date picker)
- Notes (Rich text editor)

#### Advanced Camera Features:
- **FOV Visualization**: Interactive field-of-view display on floorplans
- **Stream Calculator**: Auto-calculate bandwidth requirements based on resolution/FPS
- **Compatibility Checker**: Warn about incompatible equipment combinations
- **Bulk Configuration**: Apply settings to multiple cameras simultaneously
- **Template System**: Save and reuse camera configurations for similar installations

### Elevator Equipment

#### Elevator Form Fields

**Basic Information:**
- Name (Text, Required: e.g., "Elevator A", "Main Passenger Elevator")
- Location (Text, Required: Building location description)
- Elevator Bank (Text, Optional: For buildings with multiple elevator groups)
- Type (Dropdown, Required: Passenger, Service, Freight, Shuttle)
- Floors Served (Text: e.g., "B1, 1-15, PH")

**Access Control Integration:**
- Access Control Type (Dropdown, Required: Card Reader, Destination Dispatch, Key Switch, None)
- Reader Location (Dropdown: Cab, Hall Call, Both, None - shown only if access control enabled)
- Reader Type (Dropdown: Proximity, Smart Card, Biometric, Multi-Technology, Mobile Credential)
- Controller Type (Dropdown: Kastle KMS, Kastle K1, Elevator Manufacturer, Other)

**Safety and Emergency Features:**
- Fire Service Capability (Toggle)
- Emergency Power Backup (Toggle)
- Emergency Communication System (Toggle)

**Integrated Equipment:**
- Camera Present (Toggle)
- Camera Selection (Dropdown, populated from project cameras, shown only if camera present)
- Intercom Present (Toggle)

**Maintenance Information:**
- Maintenance Company (Text)
- Last Maintenance Date (Date picker)
- Notes (Rich text editor)

### Turnstile Equipment

#### Turnstile Form Fields

**Basic Configuration:**
- Name (Text, Required)
- Location (Text, Required)
- Floor (Dropdown, Required)
- Type (Dropdown, Required: Optical, Tripod, Full-Height, Swing Gate, Speed Gate)

**Technical Specifications:**
- Manufacturer (Text with auto-suggestions)
- Model (Text)
- Lane Width (Number with unit selector: inches/cm)
- Throughput Rate (Number: people per minute)

**Security Features:**
- Tailgating Detection (Toggle)
- Bidirectional Operation (Toggle)
- Emergency Egress Type (Dropdown, Required: Fail Safe, Battery Backup, Mechanical Release)

**Access Control Integration:**
- Reader Type (Dropdown: Proximity, Smart Card, Biometric, Multi-Technology, Mobile Credential)
- Reader Location (Dropdown: Entry Side, Exit Side, Both Sides)

**Physical Characteristics:**
- Cabinet Material (Dropdown: Stainless Steel, Powder Coated, Glass, Custom)
- Barrier Type (Dropdown: Swing, Retractable, Drop Arm, Glass Panels, None)
- Barrier Height (Number with unit selector)

**Accessibility Features:**
- ADA Compliant (Toggle)
- ADA Gate Present (Toggle)

**Technical Details:**
- Power Requirements (Text: voltage, amperage)
- Maintenance Company (Text)
- Last Maintenance Date (Date picker)
- Notes (Rich text editor)

### Intrusion Detection Equipment

#### Intrusion Detection Form Fields

**Device Information:**
- Name (Text, Required)
- Location (Text, Required)
- Floor (Dropdown, Required)
- Type (Dropdown, Required: Motion Detector, Glass Break, Door Contact, Duress Button, Other)
- Model (Text)

**Panel Integration:**
- Zone Assignment (Text: e.g., "Zone 01", "A-12")
- Panel Type (Dropdown, Required: Kastle KMS, Kastle K1, DSC, Honeywell, Bosch, Other)
- Panel Connection (Dropdown, Required: Hardwired, Wireless, Hybrid)

**Zone Configuration:**
- 24-Hour Zone (Toggle: for devices that are always armed)
- Entry/Exit Zone (Toggle: for devices with entry delay)

**Device Settings:**
- Mounting Height (Number with unit selector)
- Coverage Area (Number with unit selector: sq ft/sq m)
- Sensitivity Adjustable (Toggle)
- Pet Immune (Toggle: for motion detectors)
- Tamper Protection (Toggle)

**Power Configuration:**
- Power Source (Dropdown, Required: Panel, Local, Battery)

**Maintenance:**
- Last Maintenance Date (Date picker)
- Notes (Rich text editor)

### Emergency Communication Equipment

#### Emergency Communication Form Fields

**Device Information:**
- Name (Text, Required)
- Location (Text, Required)
- Floor (Dropdown, Required)
- Type (Dropdown, Required: Emergency Phone, Intercom, Call Box, Mass Notification, Duress Button)

**Technical Specifications:**
- Manufacturer (Text)
- Model (Text)
- Mounting Type (Dropdown, Required: Wall, Pedestal, Recessed, Desk, Other)

**Accessibility:**
- ADA Compliant (Toggle)
- Audio/Visual Capability (Dropdown, Required: Audio Only, Visual Only, Both)

**Communication Setup:**
- Connection Type (Dropdown, Required: Analog, VoIP, Cellular, Radio)
- Monitoring Type (Dropdown, Required: On-site, Central Station, Local Emergency Services, KVG)

**Power and Backup:**
- Backup Power (Toggle)

**Maintenance:**
- Last Maintenance Date (Date picker)
- Notes (Rich text editor)

## KVG Data Collection System

### Tab 1: Discovery (BDM) Interface

#### Client Information Section
Create a clean, professional form with these grouped fields:

**Company Details Card:**
- Client Name (Text, Required, Auto-suggest from existing clients)
- Client Industry (Dropdown, Required with icons for each industry type)
- Client Address (Text, Required with address validation)
- City (Text, Required)
- State (Dropdown, Required, US states)
- ZIP Code (Text, Required, format validation)

**Primary Contact Card:**
- Contact Name (Text, Required)
- Title (Text, Required)
- Phone (Text, Required, phone format validation)
- Email (Email, Required, email validation)

**Relationship Status Card:**
- Existing Kastle Client (Radio buttons with descriptions)
  * Yes - Current active client
  * No - New potential client  
  * Former - Previous client, no longer active

#### Opportunity Information Section

**Opportunity Details Card:**
- Opportunity Name (Text, Required, auto-suggest format: "Company Name - KVG Service")
- Opportunity Stage (Dropdown with progress indicator)
- Expected Close Date (Date picker, Required)
- Annual Opportunity Value (Currency, Optional, with $ symbol)

**Competition Analysis Card:**
- Competing Solutions (Multi-select checkboxes with "Other" text field)
- Decision Timeline (Dropdown with urgency indicators)
- Budget Range (Dropdown, Optional, with "Prefer not to disclose" option)

#### Site Information Section

**Property Overview Card:**
- Property Type (Dropdown with representative icons)
- Total Square Footage (Number, Required, with format helpers)
- Number of Buildings (Number, Required)
- Number of Floors (Number, Required)
- Number of Entrances (Number, Required)

**Infrastructure Card:**
- Parking Type (Multi-select checkboxes)
- Current Security Measures (Multi-select checkboxes)

#### Security Assessment Section

**Current State Analysis Card:**
- Current Issues/Incidents (Rich text editor, Required)
- Primary Security Concern (Dropdown with descriptive icons)
- KVG Interest Reason (Rich text editor, Required)

**Decision Process Card:**
- Decision Maker (Text, Required)
- Decision Process (Rich text editor, Required, with prompt text)

#### Form Behavior:
- **Auto-save**: Save form data every 30 seconds and on field changes
- **Progress indicator**: Show completion percentage at top of form
- **Validation feedback**: Real-time validation with helpful error messages
- **Smart defaults**: Pre-populate fields based on existing client data
- **Guided workflow**: Highlight next required field and provide contextual help

### Tab 2: Technical Assessment (Sales Engineer) Interface

#### Current System Assessment Section

**Existing Camera Infrastructure Card:**
- Existing Camera System (Radio with conditional fields)
  * If "Yes" or "Partial": Show manufacturer and age fields
- Camera Manufacturer (Multi-select dropdown with search)
- Camera Age (Dropdown with visual timeline)

#### Camera Inventory Section

**Camera Count Matrix:**
Create a visual table layout:

| Camera Type | Indoor Count | Outdoor Count | Notes |
|-------------|--------------|---------------|-------|
| Fixed Single-Lens | Number input | Number input | Auto-suggest |
| PTZ | Number input | Number input | Auto-suggest |
| Dual-Lens | Number input | Number input | Auto-suggest |
| Quad-Lens/Multi-Sensor | Number input | Number input | Auto-suggest |
| Specialty Cameras | Number input | Number input | Auto-suggest |

**Camera Specifications Card:**
- Typical Resolution (Dropdown with visual examples)
- Connection Type (Dropdown with technical descriptions)

#### Current VMS Section

**Video Management Card:**
- Current VMS System (Radio with conditional expansion)
- VMS Manufacturer (Dropdown, shown if system exists)
- Recording Duration (Dropdown with storage implications)

#### Network Infrastructure Section

**Internet Connection Card:**
- Connection Type (Dropdown with speed implications)
- Download Speed (Dropdown with bandwidth calculator)
- Upload Speed (Dropdown with real-time adequacy check)

**Network Management Card:**
- Managed By (Dropdown affecting support complexity)
- Firewall Present (Radio with security implications)
- Available Network Ports (Radio with installation impact)
- PoE Availability (Dropdown affecting power planning)

#### Real-Time Calculations Display

**Gateway Requirements Panel (Auto-updating):**
- Total Camera Count: [Calculated]
- Total Stream Count: [Calculated based on camera types]
- Standard Gateways Needed: [Calculated: streams ÷ 16, rounded up]
- High-Capacity Gateways Needed: [Calculated: streams ÷ 32, rounded up]
- Estimated Bandwidth: [Calculated based on resolution and stream count]

**Adequacy Assessment Panel:**
- Current vs. Required Bandwidth (Visual gauge)
- Network Upgrade Required (Auto-determined Yes/No/Maybe)
- Recommendations (Auto-generated based on gaps)

#### Form Behavior:
- **Real-time calculations**: Update gateway requirements as camera counts change
- **Visual feedback**: Use color coding (green/yellow/red) for adequacy assessments
- **Technical tooltips**: Provide explanations for technical terms
- **Comparison tools**: Show current vs. recommended specifications side-by-side

### Tab 3: Voice of Customer (Account Manager) Interface

#### Monitoring Requirements Section

**Schedule Configuration Card:**
- Monitoring Schedule Type (Visual radio buttons with time representations)
  * 24/7 (Always-on icon)
  * After-Hours Only (Clock icon showing evening hours)
  * Business Hours Only (Business hours clock)
  * Custom Schedule (Calendar icon)

**Custom Schedule Builder (shown if Custom selected):**
- Interactive weekly calendar grid
- Time picker for start/end times
- Special holiday configuration
- Weekend monitoring toggle

**Service Level Card:**
- Weekend Monitoring (Toggle with days selector)
- Holiday Monitoring (Toggle with holiday calendar)
- Special Event Monitoring (Toggle with event planner)

#### Alert Configuration Section

**Alert Triggers Card:**
- Primary Alert Triggers (Multi-select with visual icons)
  * Motion Detection (Movement icon)
  * Line Crossing (Arrow crossing line icon)
  * Loitering (Person waiting icon)
  * Object Detection (Object icon)
  * Other (Custom text field)

**Priority Areas Card:**
- Alert Priority Areas (Multi-select with location icons)
  * Entrances (Door icon)
  * Parking Areas (Car icon)
  * Perimeter (Fence icon)
  * Interior Common Areas (Building icon)
  * Restricted Areas (Lock icon)
  * Other (Custom text field)

**Custom Instructions Card:**
- Specific Alert Instructions (Rich text editor with templates)
- Permitted Hours of Operation (Text with time format helper)

#### Response Protocol Section

**Contact Hierarchy Card:**
- Primary Contact Sequence (Drag-and-drop ordered list)
  * Each contact includes: Name, Title, Phone, Expected Response Time
  * Add/Remove contact buttons
  * Drag handles for reordering

**Response Actions Card:**
- Authorized Response Actions (Multi-select checkboxes)
  * Live Voice Down
  * Recorded Audio Message
  * Contact On-site Security
  * Contact Designated Person
  * Call Police
  * No Action/Record Only

**Escalation Settings Card:**
- Escalation Time (Dropdown with visual timer)
- Police Dispatch Authorization (Radio with legal implications note)
- Guard Dispatch Authorization (Radio with service level note)

#### Compliance & Reporting Section

**Compliance Requirements Card:**
- Industry Compliance (Multi-select with regulation descriptions)
- Video Retention Requirement (Dropdown with storage implications)
- Custom Retention Period (Number input, shown if Custom selected)

**Reporting Preferences Card:**
- Regular Report Requirements (Multi-select checkboxes)
- Custom Report Requirements (Rich text editor with examples)

#### Form Behavior:
- **Visual schedule builder**: Interactive calendar for custom schedules
- **Contact management**: Easy add/edit/remove contacts with validation
- **Template library**: Pre-built response templates for common scenarios
- **Compliance guidance**: Context-sensitive help for regulatory requirements

### Tab 4: Site Assessment (Field Technician) Interface

#### Site Visit Information Section

**Visit Details Card:**
- Site Visit Date (Date picker, Required, default to today)
- Conducted By (Text, Required, auto-populate from logged-in user)
- Site Contact Information (Name, Title, Phone - all Required)

#### Camera Verification Section

**Camera Count Verification Card:**
- Verified Indoor Count (Number, auto-populate from Technical Assessment)
- Verified Outdoor Count (Number, auto-populate from Technical Assessment)
- Discrepancy Indicator (Visual alert if counts don't match previous data)

**Documentation Upload Card:**
- Camera Location Photos (Multi-file drag-and-drop upload)
  * GPS tagging for uploaded photos
  * Auto-thumbnail generation
  * Annotation tools for marking photos

**Position Changes Card:**
- Camera Position Changes Required (Radio: Yes/No)
- Change Details (Rich text editor, shown if Yes, with drawing tools)

#### Infrastructure Assessment Section

**Pathway Verification Cards:**
Each with Yes/No/Partial radio and conditional text area for issues:
- Cable Pathways Verified
- Network Access Points Confirmed  
- Power Availability Confirmed

#### Gateway Installation Section

**Gateway Planning Card:**
- Recommended Gateway Locations (Rich text with location numbering)
- Gateway Location Photos (Multi-file upload with location tagging)
- Network Connectivity Assessment (Radio: Good/Fair/Poor/None)
- Connectivity Issues (Text area, shown if not Good)

#### Installation Requirements Section

**Access and Scheduling Card:**
- Access Restrictions (Rich text with common restriction templates)
- Work Hour Restrictions (Rich text with time format helpers)

**Special Requirements Card:**
- Special Equipment Needed (Radio: Yes/No)
- Equipment Details (Rich text, shown if Yes, with equipment catalog integration)
- Permits Required (Radio: Yes/No/Unknown)
- Permit Details (Rich text, shown if Yes, with permit type suggestions)

#### Assessment Summary Section

**Feasibility Card:**
- Overall Feasibility (Dropdown with visual indicators)
  * Fully Feasible (Green checkmark)
  * Mostly Feasible with Minor Issues (Yellow caution)
  * Feasible with Significant Issues (Orange warning)
  * Not Feasible (Red X)

**Timeline and Next Steps Card:**
- Estimated Installation Time (Dropdown with complexity indicators)
- Critical Issues (Rich text, shown if not Fully Feasible)
- Recommended Next Steps (Rich text with action templates)
- Additional Notes (Rich text for miscellaneous observations)

**Photo Documentation Card:**
- General Site Photos (Multi-file upload with categorization)
  * Exterior views
  * Interior spaces
  * Infrastructure details
  * Problem areas
  * Opportunities

#### Mobile-Optimized Features:
- **Camera integration**: One-tap photo capture with automatic GPS tagging
- **Voice-to-text**: Speak notes instead of typing for faster data entry
- **Offline capability**: Work without internet, sync when connection restored
- **Drawing tools**: Sketch on photos to highlight important details
- **Template library**: Quick-select common findings and recommendations

### Tab 5: Gateway Calculator Interface

#### Camera Input Matrix

**Camera Type Grid:**
Create a calculator-style interface:

| Camera Type | Count | Streams per Camera | Total Streams |
|-------------|-------|-------------------|---------------|
| Fixed Single-Lens (Indoor) | Number input | 1 (display only) | Auto-calculated |
| Fixed Single-Lens (Outdoor) | Number input | 1 (display only) | Auto-calculated |
| PTZ Cameras | Number input | 1 (display only) | Auto-calculated |
| Dual-Lens Cameras | Number input | 2 (display only) | Auto-calculated |
| Quad-Lens Cameras | Number input | 4 (display only) | Auto-calculated |

#### Resolution Configuration Section

**Resolution Distribution Card:**
- SD Cameras (Number input with bandwidth multiplier: 0.5x)
- HD Cameras (Number input with bandwidth multiplier: 1.0x)
- 4K Cameras (Number input with bandwidth multiplier: 2.0x)

#### Real-Time Calculations Display

**Stream Summary Panel:**
- Total Camera Count: [Sum of all cameras]
- Total Stream Count: [Calculated based on camera types]
- Resolution Factor: [Weighted average based on resolution distribution]
- Adjusted Stream Count: [Stream count × resolution factor]

**Gateway Requirements Panel:**
- Standard Gateways (16 streams each): [Adjusted streams ÷ 16, rounded up]
- High-Capacity Gateways (32 streams each): [Adjusted streams ÷ 32, rounded up]
- Recommended Configuration: [Based on cost optimization]

**Redundancy Options Panel:**
- Redundancy Type (Dropdown: None, N+1, N+2, 2N)
- Additional Gateways for Redundancy: [Calculated based on selection]
- Total Gateways with Redundancy: [Base + redundancy]

**Bandwidth Analysis Panel:**
- Estimated Total Bandwidth: [Streams × resolution factor × 2 Mbps average]
- Bandwidth per Gateway: [Total bandwidth ÷ gateway count]
- Network Adequacy: [Comparison with Technical Assessment data]

#### Cost Estimation Section

**Equipment Cost Panel:**
- Gateway Unit Cost: [Standard vs. High-Capacity pricing]
- Total Gateway Cost: [Unit cost × quantity]
- Installation Cost Estimate: [Based on complexity factors]
- Total Hardware Investment: [Equipment + installation]

**Service Cost Panel:**
- Monthly Monitoring Fee: [Based on stream count and service level]
- Annual Service Cost: [Monthly × 12]
- 3-Year Total Cost: [Hardware + (Service × 3)]

#### Optimization Recommendations

**Efficiency Analysis Panel:**
- Standard vs. High-Capacity Comparison
- Cost per Stream Analysis
- Bandwidth Utilization Efficiency
- Scalability Recommendations

#### Form Behavior:
- **Live calculations**: All numbers update instantly as inputs change
- **Visual indicators**: Color-coded efficiency meters and status indicators
- **Comparison tools**: Side-by-side analysis of different configurations
- **Export capability**: Generate calculator summary for proposals
- **Template saving**: Save configurations for similar future projects

## Floorplan Management System

### PDF Rendering Engine

#### Core Rendering Requirements

**PDF Processing:**
- Support for multi-page PDF documents up to 100 pages
- High-quality rendering at multiple zoom levels (10% to 1000%)
- Coordinate precision for exact marker placement
- Memory-efficient handling of large architectural drawings
- Print-quality output at all zoom levels

**Zoom and Navigation:**
- Smooth zoom with mouse wheel and pinch gestures
- Pan functionality with mouse drag and touch gestures
- Zoom to fit, zoom to width, and zoom to selection
- Minimap navigation for large documents
- Page thumbnail navigation for multi-page documents

**Performance Optimization:**
- Progressive loading for large PDFs
- Viewport-based rendering to handle large documents
- Background pre-loading of adjacent pages
- Caching of rendered content at multiple zoom levels

#### Coordinate System Management

**Precision Coordinate Mapping:**
- PDF coordinate space to screen coordinate conversion
- Maintain precision across all zoom levels
- Handle PDF rotation and orientation changes
- Support for multiple measurement units (feet, meters, pixels)

**Marker Positioning:**
- Sub-pixel precision for marker placement
- Snap-to-grid functionality with configurable grid sizes
- Magnetic snap to PDF elements (walls, doors, etc.)
- Coordinate display and input for precise positioning

### Interactive Marker System

#### Marker Types and Visual Representation

**Equipment Marker Types:**
Each marker type has distinct visual representation:

1. **Camera Markers:**
   - Icon: Camera symbol with orientation indicator
   - Color coding by camera type (Fixed: Blue, PTZ: Green, etc.)
   - Field of view visualization (cone or sector)
   - Range circles for coverage visualization
   - Label showing camera name and key specs

2. **Access Point Markers:**
   - Icon: Door symbol with access level indicator
   - Color coding by security level (Basic: Gray, High: Red, etc.)
   - Reader position indicators
   - Door swing direction visualization
   - Security zone boundary display

3. **Elevator Markers:**
   - Icon: Elevator car symbol
   - Floor service indicators
   - Access control integration status
   - Traffic flow indicators

4. **Turnstile Markers:**
   - Icon: Turnstile symbol with direction arrows
   - Throughput capacity visualization
   - ADA compliance indicators
   - Queue area recommendations

5. **Emergency Equipment Markers:**
   - Icon: Type-specific symbols (phone, alarm, etc.)
   - Coverage area indicators
   - Emergency egress path integration
   - Communication network connections

#### Marker Interaction Features

**Placement and Editing:**
- Click-to-place new markers with equipment selection
- Drag-and-drop repositioning with live coordinate feedback
- Rotation handles for directional equipment
- Resize handles for area-coverage equipment
- Context menus for marker actions (Edit, Delete, Duplicate, Properties)

**Visual Feedback:**
- Hover states with equipment information tooltips
- Selection highlighting with control handles
- Visual grouping indicators for related equipment
- Status color coding (Planned: Gray, Installed: Green, etc.)
- Animation indicators for recently modified markers

**Property Integration:**
- Click marker to open equipment details sidebar
- Inline editing of basic properties (name, status, notes)
- Deep-link to full equipment configuration forms
- Real-time sync between marker properties and equipment database

#### Touch-Optimized Controls (iPad/Mobile)

**Touch Gesture Support:**
- Single tap: Select marker
- Double tap: Open equipment properties
- Long press: Show context menu
- Pinch: Zoom in/out
- Two-finger pan: Move viewport
- Three-finger tap: Show all markers

**Mobile-Friendly Interface:**
- Larger touch targets for markers and controls
- Touch-optimized context menus
- Gesture-based marker manipulation
- Voice commands for hands-free operation
- Haptic feedback for successful actions

**iPad-Specific Optimizations:**
- Apple Pencil support for precise marker placement
- Split-screen support for equipment forms alongside floorplan
- Scribble support for text input
- Drag-and-drop between equipment lists and floorplan

### Layer Management System

#### Layer Creation and Organization

**Layer Types:**
1. **Equipment Layers:** Organized by equipment type
   - Camera Equipment Layer
   - Access Control Layer
   - Emergency Systems Layer
   - Infrastructure Layer

2. **Analysis Layers:** For specialized views
   - Security Coverage Analysis
   - Network Infrastructure
   - Power Requirements
   - Maintenance Zones

3. **Annotation Layers:** For notes and markup
   - Installation Notes
   - Client Feedback
   - Change Requests
   - As-Built Documentation

**Layer Properties:**
- Name (Text, Required, unique per floorplan)
- Color (Color picker with project palette)
- Visibility (Toggle with fade animation)
- Opacity (Slider, 0-100%)
- Lock state (Prevent accidental editing)
- Order (Drag-to-reorder with visual feedback)

#### Layer Control Interface

**Layer Panel Design:**
- Collapsible layer tree with expand/collapse controls
- Eye icons for visibility toggle
- Lock icons for edit protection
- Color swatches for quick identification
- Drag handles for reordering
- Context menus for layer operations

**Bulk Layer Operations:**
- Show/Hide All Layers
- Show Only Selected Layer
- Lock/Unlock All Layers
- Export Layer as Separate Document
- Merge Multiple Layers

**Layer-Based Filtering:**
- Filter equipment lists by visible layers
- Search within specific layers
- Show/hide equipment based on layer status
- Generate layer-specific reports

### Marker Synchronization System

#### Equipment Database Integration

**Bi-Directional Sync:**
- Equipment changes automatically update related markers
- Marker position changes update equipment location fields
- Status changes propagate between systems
- Real-time conflict resolution for simultaneous edits

**Sync Conflict Handling:**
- Version tracking for markers and equipment
- Visual indicators for sync conflicts
- User-friendly conflict resolution interface
- Automatic backup before major changes

**Batch Operations:**
- Select multiple markers for bulk operations
- Apply property changes to marker groups
- Bulk status updates (e.g., mark all as "Installed")
- Mass marker deletion with confirmation

#### Change Tracking and History

**Version Control:**
- Track all marker modifications with timestamps
- User attribution for all changes
- Before/after snapshots for major modifications
- Rollback capability for recent changes

**Audit Trail:**
- Comprehensive change log with user details
- Integration with project activity timeline
- Export change history for compliance
- Visual diff showing marker position changes

### Advanced Visualization Features

#### Coverage Analysis Tools

**Camera Coverage Visualization:**
- Field of view overlays with adjustable parameters
- Blind spot identification and highlighting
- Overlap analysis between multiple cameras
- Line-of-sight calculations with obstruction detection

**Access Control Zone Mapping:**
- Security zone boundary visualization
- Access level heat maps
- Traffic flow pattern overlay
- Tailgating risk area identification

#### 3D Visualization Integration

**Elevation Views:**
- Side-view generation from floor plan data
- Mounting height visualization
- Vertical coverage analysis
- Multi-floor relationship mapping

**Equipment Perspective Views:**
- Camera view simulation from marker positions
- Access point approach angles
- Emergency equipment visibility analysis
- Installation accessibility assessment

### Export and Documentation Features

#### Professional Documentation Generation

**Floorplan Export Options:**
- High-resolution PDF with layers
- CAD file export (DWG/DXF) with equipment blocks
- Image formats (PNG, JPG, SVG) at various resolutions
- Interactive web-based floorplan viewers

**Equipment Documentation:**
- Auto-generated equipment schedules from markers
- Installation drawings with detailed callouts
- As-built documentation templates
- Maintenance access drawings

#### Integration with Reporting System

**Report Integration:**
- Embed floorplan views in project reports
- Equipment location verification documentation
- Visual installation progress tracking
- Client presentation materials with branded layouts

**Custom View Generation:**
- Create saved views for specific purposes
- Generate equipment-specific floorplan views
- Client-friendly simplified layouts
- Contractor installation drawings

## AI Integration System

### Azure OpenAI Integration Architecture

#### Service Configuration

**API Integration Setup:**
- Azure OpenAI endpoint configuration
- API key management with secure storage
- Model selection and version management
- Rate limiting and error handling
- Cost monitoring and usage tracking

**Model Selection:**
- Claude-3-7-sonnet-20250219 for complex analysis tasks
- GPT-4 Turbo for document processing
- GPT-4 Vision for image analysis
- Model fallback strategies for reliability

#### Security and Compliance

**Data Protection:**
- Encrypt all data transmitted to Azure OpenAI
- Implement data residency controls
- Audit logs for all AI service interactions
- Compliance with industry security standards
- No sensitive client data stored in AI service logs

### Site Assessment AI Analysis

#### Photo Analysis Engine

**Image Processing Capabilities:**
- Automatic equipment identification in site photos
- Security vulnerability detection
- Infrastructure assessment from images
- Equipment condition evaluation
- Compliance verification through visual inspection

**Analysis Outputs:**
- Equipment inventory suggestions based on visible assets
- Security gap identification with recommendations
- Installation feasibility assessment
- Cost estimation based on visual complexity
- Risk assessment for identified vulnerabilities

#### Document Analysis

**Document Processing:**
- Extract equipment specifications from vendor documentation
- Parse existing security system documentation
- Analyze floor plans for equipment placement optimization
- Process maintenance records for equipment condition assessment
- Review compliance documentation for gap analysis

**Structured Data Extraction:**
- Convert unstructured documents to database entries
- Validate extracted data against industry standards
- Suggest equipment configurations based on requirements
- Generate implementation timelines from scope documents

### Equipment Recommendation Engine

#### Intelligent Equipment Selection

**Requirement Analysis:**
- Process site assessment data to determine equipment needs
- Analyze coverage requirements for optimal camera placement
- Evaluate access control needs based on security zones
- Recommend emergency equipment based on building codes
- Suggest network infrastructure for equipment support

**Optimization Algorithms:**
- Minimize equipment count while maintaining coverage
- Optimize placement for maximum security effectiveness
- Balance cost constraints with security requirements
- Consider maintenance accessibility in recommendations
- Factor scalability needs for future expansion

#### Configuration Suggestions

**Automated Configuration:**
- Generate initial equipment configurations based on best practices
- Suggest camera angles and mounting heights
- Recommend access control reader placements
- Propose network architecture for equipment connectivity
- Create maintenance schedules based on equipment types

**Validation and Quality Assurance:**
- Cross-reference recommendations with industry standards
- Validate configurations against building codes
- Check for equipment compatibility issues
- Ensure compliance with customer requirements
- Flag potential installation challenges

### Interactive Quote Review System

#### AI-Powered Quote Analysis

**Comprehensive Review Process:**
- Analyze all collected KVG data for completeness
- Identify missing information critical for accurate pricing
- Cross-reference technical requirements with customer needs
- Validate equipment counts against site assessment data
- Check for inconsistencies between different data sources

**Gap Identification:**
- Highlight incomplete sections in data collection tabs
- Identify conflicting information between stakeholder inputs
- Flag unusual requirements that may need clarification
- Suggest additional data points for more accurate quotes
- Recommend site visits for unclear requirements

#### Interactive Clarification System

**Question Generation Engine:**
- Generate specific questions about missing or unclear data
- Prioritize questions based on impact on quote accuracy
- Create multiple choice options where appropriate
- Provide context for why information is needed
- Suggest reasonable defaults based on industry standards

**User Interaction Interface:**
- Present questions in conversational format
- Allow users to provide additional context beyond standard answers
- Support follow-up questions based on previous responses
- Enable users to defer questions and return later
- Track question resolution and data enrichment progress

#### Enhanced Analysis with User Input

**Data Enrichment Process:**
- Integrate user responses into existing data model
- Re-analyze requirements with enriched data set
- Update equipment recommendations based on new information
- Recalculate gateway requirements and costs
- Validate enhanced data against technical constraints

**Iterative Improvement:**
- Learn from user corrections and feedback
- Improve question generation based on response patterns
- Refine recommendation algorithms using historical data
- Adapt to user preferences and company standards
- Continuously update knowledge base with new scenarios

### AI-Generated Reports and Proposals

#### Intelligent Report Generation

**Content Creation:**
- Generate executive summaries based on project data
- Create technical specifications from equipment configurations
- Develop implementation timelines with milestone tracking
- Produce cost justifications with ROI analysis
- Generate compliance documentation for regulatory requirements

**Personalization and Customization:**
- Adapt writing style to customer industry and preferences
- Include relevant case studies and testimonials
- Customize technical depth based on audience expertise
- Incorporate customer branding and formatting preferences
- Generate multiple report versions for different stakeholders

#### Quality Assurance and Review

**Automated Review Process:**
- Check generated content for accuracy and consistency
- Validate technical specifications against equipment databases
- Ensure cost calculations are correct and complete
- Verify compliance with company standards and policies
- Flag content that requires human review

**Human-AI Collaboration:**
- Provide draft content for human editors to refine
- Enable easy modification of AI-generated sections
- Track changes and maintain version control
- Allow experts to add specialized knowledge
- Facilitate collaborative review and approval processes

## User Interface Requirements

### Responsive Design Framework

#### Breakpoint Strategy

**Desktop (1200px+):**
- Full sidebar navigation with expanded equipment categories
- Multi-column layouts for equipment forms
- Side-by-side floorplan and equipment list views
- Full-featured rich text editors and advanced controls
- Comprehensive data tables with all columns visible

**Tablet (768px - 1199px):**
- Collapsible sidebar with icon-based navigation
- Single-column forms with logical grouping
- Overlay panels for equipment details over floorplans
- Touch-optimized controls with larger tap targets
- Simplified tables with expandable rows for details

**Mobile (< 768px):**
- Bottom tab navigation for primary functions
- Full-screen forms with step-by-step progression
- Full-screen floorplan view with floating action buttons
- Swipe gestures for navigation and actions
- Card-based layouts for equipment lists

#### Component Adaptation

**Navigation Systems:**
- Desktop: Persistent sidebar with hover states
- Tablet: Collapsible sidebar with swipe gestures
- Mobile: Bottom tab bar with badge notifications

**Form Layouts:**
- Desktop: Multi-column layouts with inline validation
- Tablet: Single column with collapsible sections
- Mobile: Step-by-step wizard with progress indicators

**Data Tables:**
- Desktop: Full tables with sorting, filtering, and pagination
- Tablet: Card-based layouts with key information
- Mobile: List views with expandable details

### Equipment Management Interface

#### Equipment List Views

**Grid View Layout:**
- Card-based equipment display with thumbnails
- Quick action buttons for common operations
- Status indicators with color coding
- Search and filter controls in header
- Bulk selection with floating action menu

**Table View Layout:**
- Sortable columns for all key equipment properties
- Inline editing for common fields
- Row selection for bulk operations
- Expandable rows for detailed information
- Export controls for data extraction

**Map View Layout:**
- Interactive floorplan with equipment markers
- Equipment list sidebar with sync to map
- Layer controls for equipment type filtering
- Click-to-locate functionality
- Real-time count updates as filters change

#### Equipment Form Design

**Multi-Step Form Wizard:**
- Progress indicator showing completion status
- Step validation with error highlighting
- Previous/Next navigation with keyboard shortcuts
- Auto-save functionality with conflict resolution
- Exit confirmation for unsaved changes

**Tabbed Interface:**
- Logical grouping of related fields
- Tab completion indicators
- Sticky tab navigation for long forms
- Cross-tab field dependencies
- Context-sensitive help panels

**Inline Editing:**
- Click-to-edit for simple fields
- Modal overlays for complex configurations
- Real-time validation feedback
- Undo/redo functionality
- Bulk editing for multiple items

### Floorplan Interface Design

#### Viewport Controls

**Zoom and Pan Controls:**
- Zoom slider with percentage display
- Zoom to fit and zoom to selection buttons
- Pan controls with keyboard arrow support
- Mouse wheel zoom with configurable sensitivity
- Touch gesture support for mobile devices

**View State Management:**
- Save and restore custom views
- Bookmark important locations
- View history with back/forward navigation
- Full-screen mode toggle
- Print-optimized view generation

#### Marker Interaction Design

**Selection and Editing:**
- Single-click selection with highlight states
- Multi-select with Ctrl/Cmd+click
- Drag handles for repositioning
- Rotation controls for directional equipment
- Resize handles for area-coverage items

**Property Panels:**
- Slide-out panels for marker properties
- Tabbed interface for complex equipment
- Quick edit mode for common properties
- Link to full equipment configuration
- Change history and audit trail

**Visual Feedback:**
- Hover states with equipment information
- Selection highlighting with control handles
- Drag preview with snap indicators
- Distance and angle measurements during placement
- Grid alignment guides

### Mobile-Specific Optimizations

#### Touch Interface Design

**Gesture Support:**
- Single tap: Select/deselect items
- Double tap: Open item details
- Long press: Context menu
- Pinch: Zoom in/out
- Two-finger pan: Move viewport
- Swipe: Navigate between pages/tabs

**Touch-Friendly Controls:**
- Minimum 44px touch targets
- Sufficient spacing between interactive elements
- Large, clear action buttons
- Swipe-enabled lists and carousels
- Drag-and-drop with visual feedback

#### Field Data Collection

**Camera Integration:**
- One-tap photo capture with automatic categorization
- GPS tagging for location verification
- Photo annotation tools for marking important details
- Batch photo upload with progress indicators
- Automatic thumbnail generation

**Voice Input Support:**
- Voice-to-text for notes and descriptions
- Voice commands for common actions
- Dictation support in text fields
- Audio note recording for complex observations
- Automatic transcription with editing capability

**Offline Capability:**
- Local data storage for offline work
- Automatic sync when connection restored
- Conflict resolution for simultaneous edits
- Progress indicators for sync operations
- Data validation before sync

### Accessibility Features

#### Screen Reader Support

**Semantic HTML Structure:**
- Proper heading hierarchy for page navigation
- ARIA labels for complex interface elements
- Role attributes for custom components
- Landmark regions for page structure
- Focus management for dynamic content

**Keyboard Navigation:**
- Tab order following logical flow
- Keyboard shortcuts for common actions
- Focus indicators for all interactive elements
- Skip links for long navigation sections
- Escape key support for modal dialogs

#### Visual Accessibility

**Color and Contrast:**
- High contrast mode support
- Color-blind friendly palettes
- Multiple methods for conveying information (not color alone)
- Adjustable text size and spacing
- Dark mode option for low-light environments

**Motion and Animation:**
- Reduced motion options for users with vestibular disorders
- Optional animations with user control
- Non-flashing content to prevent seizures
- Timeout extensions for timed interactions
- Pause controls for auto-playing content

### Performance Optimization

#### Loading and Rendering

**Progressive Loading:**
- Skeleton screens during initial load
- Lazy loading for images and heavy components
- Pagination for large data sets
- Background preloading of likely-needed data
- Caching strategies for frequently accessed content

**Memory Management:**
- Efficient PDF rendering with viewport-based loading
- Image optimization and compression
- Component unmounting to free memory
- Database query optimization
- CDN utilization for static assets

#### User Experience Enhancement

**Feedback and Notifications:**
- Toast notifications for action confirmations
- Progress indicators for long-running operations
- Error messages with clear resolution steps
- Success confirmations with next action suggestions
- Status indicators for system health

**Workflow Optimization:**
- Auto-save functionality to prevent data loss
- Smart defaults based on user patterns
- Recently used lists for quick access
- Bulk operations for efficiency
- Undo/redo functionality for error recovery

## Authentication & Security

### Microsoft Azure AD Integration

#### Single Sign-On (SSO) Implementation

**Authentication Flow:**
- OAuth 2.0 / OpenID Connect implementation
- Automatic redirect to Azure AD login
- Token-based authentication with refresh capability
- Silent authentication for seamless user experience
- Multi-factor authentication support when required by tenant

**User Provisioning:**
- Automatic user creation on first login
- Profile information sync from Azure AD
- Group membership mapping to application roles
- Just-in-time user provisioning
- Deprovisioning when access is revoked

**Session Management:**
- Secure session token generation and validation
- Configurable session timeout with warning notifications
- Session persistence across browser sessions
- Concurrent session management
- Automatic logout on security events

#### Role-Based Access Control (RBAC)

**Role Definitions:**

1. **Admin:**
   - Full system access including user management
   - System configuration and settings
   - Data export and reporting capabilities
   - Audit log access and management
   - API key and integration management

2. **BDM (Business Development Manager):**
   - Create and edit projects
   - Complete Discovery tab in KVG module
   - View assigned project dashboards
   - Generate initial client reports
   - Access to sales pipeline data

3. **Sales Engineer:**
   - Technical Assessment tab completion
   - Gateway Calculator access
   - Equipment configuration and recommendations
   - Technical documentation generation
   - Integration with vendor systems

4. **Account Manager:**
   - Voice of Customer tab completion
   - Client communication management
   - Proposal review and approval workflow
   - Service level configuration
   - Contract and pricing management

5. **Field Technician:**
   - Site Assessment tab completion
   - Mobile data collection tools
   - Photo and document upload
   - Equipment installation tracking
   - Maintenance scheduling and reporting

6. **Viewer:**
   - Read-only access to assigned projects
   - Report viewing and export
   - Dashboard access without editing
   - Comment and annotation capabilities
   - Notification viewing

**Permission Matrix:**

| Feature | Admin | BDM | Sales Engineer | Account Manager | Field Tech | Viewer |
|---------|-------|-----|---------------|----------------|------------|--------|
| Project Creation | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Equipment Management | ✓ | ✗ | ✓ | ✗ | Limited | ✗ |
| Floorplan Upload | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| KVG Discovery | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| KVG Technical | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| KVG Voice of Customer | ✓ | ✗ | ✗ | ✓ | ✗ | ✗ |
| KVG Site Assessment | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Report Generation | ✓ | ✓ | ✓ | ✓ | Limited | ✓ |
| User Management | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

#### Data Security Implementation

**Encryption Standards:**
- TLS 1.3 for all data in transit
- AES-256 encryption for sensitive data at rest
- Database encryption with key rotation
- Encrypted file storage for uploads
- Secure backup encryption

**Data Protection:**
- Personal Identifiable Information (PII) identification and protection
- Data masking for non-production environments
- Secure data disposal procedures
- Data retention policies with automatic cleanup
- Compliance with GDPR, CCPA, and industry standards

### API Security

#### Authentication and Authorization

**API Key Management:**
- Secure API key generation with entropy requirements
- Key rotation policies and procedures
- Scope-limited keys for different integrations
- Rate limiting per API key
- Audit logging for all API access

**Request Security:**
- Request signing for critical operations
- Timestamp validation to prevent replay attacks
- IP whitelist support for sensitive endpoints
- Request size limits to prevent abuse
- Input validation and sanitization

#### Data Validation and Sanitization

**Input Validation:**
- Type checking for all input parameters
- Range validation for numeric inputs
- Format validation for emails, phone numbers, etc.
- File type and size validation for uploads
- SQL injection prevention through parameterized queries

**Output Sanitization:**
- HTML encoding for user-generated content
- JSON response sanitization
- Error message sanitization to prevent information disclosure
- Log sanitization to remove sensitive data
- Response header security (CSP, HSTS, etc.)

### Audit and Compliance

#### Comprehensive Audit Logging

**User Activity Tracking:**
- Login/logout events with IP addresses
- Data access and modification events
- Failed authentication attempts
- Permission changes and role modifications
- File upload and download activities

**System Event Logging:**
- Database transactions with user attribution
- API calls with request/response logging
- System errors and exceptions
- Performance metrics and alerts
- Security events and anomalies

**Data Change Tracking:**
- Before and after values for all modifications
- Timestamp and user attribution for changes
- Batch operation tracking
- Automated change detection
- Change approval workflows

#### Compliance Framework

**Industry Standards:**
- SOC 2 Type II compliance preparation
- ISO 27001 security management alignment
- NIST Cybersecurity Framework implementation
- Industry-specific compliance (HIPAA, PCI DSS as needed)
- Regular compliance assessments and updates

**Data Governance:**
- Data classification and handling procedures
- Privacy by design implementation
- Data subject rights management (GDPR)
- Cross-border data transfer controls
- Data breach notification procedures

### Security Monitoring

#### Real-Time Monitoring

**Threat Detection:**
- Unusual access pattern detection
- Brute force attack prevention
- Anomaly detection in user behavior
- Geographic access monitoring
- Failed request pattern analysis

**Performance Monitoring:**
- Real-time system health monitoring
- Database performance tracking
- API response time monitoring
- Resource utilization alerts
- Capacity planning metrics

#### Incident Response

**Security Incident Procedures:**
- Automated incident detection and alerting
- Incident classification and escalation procedures
- Forensic data collection and preservation
- Communication plans for security events
- Post-incident analysis and improvement processes

**Recovery Procedures:**
- Backup and restore testing procedures
- Disaster recovery planning
- Business continuity management
- Data recovery point and time objectives
- Incident recovery time tracking

## Mobile Optimization

### Responsive Design Strategy

#### Progressive Web App (PWA) Features

**Offline Capability:**
- Service worker implementation for caching critical resources
- Offline data storage using IndexedDB
- Background sync for form submissions
- Offline indicator with graceful degradation
- Automatic sync when connection restored

**App-Like Experience:**
- Add to home screen functionality
- Splash screen during app loading
- Full-screen mode without browser UI
- Push notifications for important updates
- App shell architecture for fast loading

#### Touch-First Interface Design

**Gesture Navigation:**
- Swipe gestures for tab navigation
- Pull-to-refresh for data updates
- Swipe-to-delete for list items
- Pinch-to-zoom for floorplans and images
- Long-press for context menus

**Touch Optimization:**
- 44px minimum touch target size
- Sufficient spacing between interactive elements
- Large, thumb-friendly action buttons
- Drag-and-drop with visual feedback
- Haptic feedback for successful actions

### Field Data Collection Tools

#### Camera Integration

**Photo Capture Features:**
- One-tap camera access from any form
- Multiple photo selection and upload
- Real-time photo compression and optimization
- GPS coordinate tagging for location verification
- Automatic orientation detection and correction

**Photo Management:**
- Automatic categorization by context (equipment type, location, etc.)
- Batch upload with progress indicators
- Thumbnail generation for quick preview
- Photo annotation with drawing tools
- Voice captions for photos

**Image Processing:**
- Client-side image resizing for bandwidth optimization
- EXIF data extraction for metadata
- Image quality adjustment for different use cases
- Format conversion (HEIC to JPEG) for compatibility
- Automatic backup to device storage

#### Voice and Audio Features

**Voice-to-Text:**
- Real-time speech recognition for notes and descriptions
- Support for technical terminology and industry jargon
- Multiple language support
- Offline voice recognition capability
- Voice command shortcuts for common actions

**Audio Recording:**
- High-quality audio recording for detailed observations
- Background noise suppression
- Audio compression for efficient storage
- Playback controls with seeking
- Automatic transcription with editing capability

### Offline-First Architecture

#### Data Synchronization

**Conflict Resolution:**
- Timestamp-based conflict detection
- User-friendly conflict resolution interface
- Automatic merging for non-conflicting changes
- Backup creation before sync operations
- Rollback capability for problematic syncs

**Sync Strategies:**
- Incremental sync for efficiency
- Priority-based sync order (critical data first)
- Background sync when app is closed
- Manual sync trigger for immediate updates
- Sync status indicators throughout the interface

#### Local Storage Management

**Data Persistence:**
- Critical form data stored locally
- Image caching for offline viewing
- Equipment templates for quick entry
- User preferences and settings
- Recent activity cache

**Storage Optimization:**
- Automatic cleanup of old cached data
- Compression of stored data
- Storage quota management
- Low storage space warnings
- Selective sync options for limited storage

### Platform-Specific Optimizations

#### iOS Optimizations

**Safari and WebKit:**
- Viewport meta tag optimization for proper scaling
- iOS safe area handling for notched devices
- Touch callout and selection customization
- Momentum scrolling for natural feel
- Web app manifest for home screen installation

**iOS-Specific Features:**
- 3D Touch support for quick actions
- Shortcuts app integration for workflow automation
- Handoff support for continuity between devices
- Dark mode support with automatic switching
- VoiceOver accessibility optimization

#### Android Optimizations

**Chrome and WebView:**
- Android viewport handling for proper scaling
- Hardware acceleration for smooth animations
- Chrome custom tabs for external links
- WebAPK generation for native app feel
- Progressive loading strategies

**Android-Specific Features:**
- Back button handling for proper navigation
- Share target registration for receiving files
- Intent handling for deep linking
- Android Auto support for automotive use
- TalkBack accessibility optimization

### Performance Optimization for Mobile

#### Network Optimization

**Bandwidth Efficiency:**
- Image optimization with WebP format support
- Lazy loading for images and heavy components
- Request batching to reduce network calls
- Compression for text-based data
- CDN utilization for static assets

**Connection Handling:**
- Network status detection and adaptation
- Graceful degradation for slow connections
- Retry logic with exponential backoff
- Connection quality assessment
- Offline queue for failed requests

#### Battery and Resource Management

**Power Efficiency:**
- Reduced background processing
- Efficient animation and transition strategies
- CPU-intensive task optimization
- Wake lock management for critical operations
- Background sync scheduling optimization

**Memory Management:**
- Component lifecycle optimization
- Image memory management
- Large dataset pagination
- Garbage collection optimization
- Memory leak prevention

### Mobile Security Considerations

#### Device Security

**Biometric Authentication:**
- Fingerprint authentication support
- Face ID/Face recognition integration
- Device PIN/pattern backup authentication
- Secure storage of authentication tokens
- Biometric availability detection

**Secure Storage:**
- Device keystore utilization
- Encrypted local database
- Secure credential storage
- Certificate pinning for API calls
- Root/jailbreak detection

#### Mobile-Specific Threats

**App Security:**
- Code obfuscation for sensitive logic
- Runtime application self-protection (RASP)
- Anti-tampering measures
- Screen recording prevention for sensitive data
- Copy/paste protection for confidential information

**Communication Security:**
- TLS certificate validation
- Public Wi-Fi protection warnings
- VPN detection and handling
- Network traffic encryption
- Man-in-the-middle attack prevention

## Reporting System

### Professional Document Generation

#### PDF Report Engine

**Layout and Formatting:**
- Professional templates with company branding
- Responsive layouts adapting to content length
- Multi-column layouts for equipment schedules
- Page breaks optimized for logical content sections
- Header and footer customization with page numbering

**Content Integration:**
- Automatic data population from database
- Dynamic charts and graphs generation
- High-resolution floorplan embedding
- Photo galleries with captions
- Tables with sorting and filtering applied

**Customization Options:**
- Client-specific branding and logos
- Template selection based on report type
- Custom color schemes matching client brands
- Watermarking for draft vs. final documents
- Digital signature support for official documents

#### Report Types and Templates

**Site Assessment Reports:**
- Executive summary with key findings
- Detailed equipment inventory with specifications
- Security gap analysis with recommendations
- Installation timeline and resource requirements
- Cost estimates with itemized breakdowns
- Risk assessment matrix
- Compliance checklist with status indicators

**KVG Service Proposals:**
- Service level comparison matrix
- Technical requirements summary
- Gateway calculator results with visual diagrams
- Monitoring schedule visualization
- Response protocol flowcharts
- Pricing structure with transparent breakdowns
- Implementation timeline with milestones

**Equipment Installation Reports:**
- Pre-installation site assessment
- Equipment placement verification
- Installation progress tracking
- Quality assurance checklists
- As-built documentation
- Testing and commissioning results
- Warranty and maintenance information

**Project Status Reports:**
- Project dashboard with key metrics
- Timeline progress with milestone tracking
- Resource utilization and allocation
- Budget tracking with variance analysis
- Risk register with mitigation strategies
- Change request log with approvals
- Next steps and action items

### Dynamic Reporting Features

#### Interactive Report Builder

**Drag-and-Drop Interface:**
- Section templates for common report components
- Real-time preview as sections are added
- Component resizing and repositioning
- Content block library with pre-built elements
- Template saving for future use

**Content Customization:**
- Rich text editor for narrative sections
- Chart builder with multiple visualization types
- Image insertion with annotation tools
- Table builder with formatting options
- Formula and calculation engine for dynamic values

**Data Integration:**
- Live data connection to project databases
- Automatic updates when underlying data changes
- Cross-reference validation between report sections
- Data filtering and aggregation options
- Export to multiple formats (PDF, Word, Excel, PowerPoint)

#### Automated Report Generation

**Scheduled Reporting:**
- Automatic report generation on predefined schedules
- Email distribution to stakeholder lists
- Report archiving with version control
- Change detection and update notifications
- Batch processing for multiple projects

**Triggered Reports:**
- Event-based report generation (project milestones, status changes)
- Exception reporting for critical issues
- Alert-based notifications with embedded reports
- API-triggered reporting for integration scenarios
- Workflow-based report approval processes

### Dashboard and Analytics

#### Executive Dashboards

**Key Performance Indicators (KPIs):**
- Project completion rates and timelines
- Equipment installation progress tracking
- Revenue pipeline and forecasting
- Resource utilization metrics
- Customer satisfaction scores
- Quality metrics and defect rates

**Visual Analytics:**
- Interactive charts with drill-down capabilities
- Geographic mapping of project locations
- Trend analysis with historical comparisons
- Predictive analytics for project outcomes
- Real-time updates with live data connections

**Customizable Views:**
- Role-based dashboard configurations
- Personalized widget selection and arrangement
- Custom date ranges and filtering options
- Saved view templates for different scenarios
- Export capabilities for executive presentations

#### Project Analytics

**Progress Tracking:**
- Gantt charts with dependency mapping
- Resource allocation and workload balancing
- Critical path analysis with risk indicators
- Milestone tracking with automated alerts
- Budget vs. actual cost analysis

**Performance Metrics:**
- Equipment installation quality scores
- Customer satisfaction tracking
- Timeline adherence measurements
- Cost variance analysis
- Team productivity metrics
- Change request impact analysis

### Export and Integration Capabilities

#### Multi-Format Export

**Document Formats:**
- PDF with searchable text and bookmarks
- Microsoft Word with editable templates
- Excel workbooks with formatted data and charts
- PowerPoint presentations with slide templates
- CSV files for data analysis
- XML/JSON for system integration

**Quality and Optimization:**
- High-resolution image export
- Vector graphics for scalable logos and diagrams
- Optimized file sizes for email distribution
- Accessibility-compliant document generation
- Print-optimized layouts with proper margins

#### API and Integration Support

**External System Integration:**
- CRM system synchronization (Salesforce, HubSpot, etc.)
- ERP integration for financial data
- Project management tool connectivity (Microsoft Project, Asana, etc.)
- Document management system integration (SharePoint, Box, etc.)
- Business intelligence tool connectivity (Power BI, Tableau, etc.)

**Real-Time Data Feeds:**
- Live dashboard connections
- Webhook support for event-driven updates
- REST API for custom integrations
- GraphQL endpoints for flexible data queries
- Batch data export for data warehousing

### Compliance and Audit Reporting

#### Regulatory Compliance

**Industry Standards:**
- SOC 2 compliance reporting
- ISO 27001 audit trail documentation
- NIST Cybersecurity Framework alignment reports
- Industry-specific compliance (HIPAA, PCI DSS, etc.)
- Data protection regulation compliance (GDPR, CCPA)

**Audit Trail Documentation:**
- Complete change history with user attribution
- Data access logs with timestamp precision
- System event correlation and analysis
- Compliance gap analysis and remediation tracking
- Evidence collection and preservation

#### Quality Assurance Reports

**Installation Quality:**
- Equipment installation checklists
- Quality control inspection reports
- Testing and commissioning documentation
- Defect tracking and resolution
- Warranty claim documentation
- Customer acceptance certificates

**Process Compliance:**
- Workflow adherence monitoring
- Standard operating procedure compliance
- Training completion tracking
- Certification and qualification verification
- Continuous improvement recommendations

## Integration Points

### CRM Integration

#### Salesforce Integration

**Data Synchronization:**
- Bidirectional sync of opportunity data
- Contact and account information sharing
- Activity tracking and history synchronization
- Custom field mapping for industry-specific data
- Real-time updates with conflict resolution

**Workflow Integration:**
- Opportunity stage progression triggering KVG workflows
- Automatic project creation from closed-won opportunities
- Task creation in Salesforce for project milestones
- Email integration with project communication
- Document attachment sharing between systems

#### HubSpot Integration

**Lead Management:**
- Lead qualification scoring based on KVG assessment data
- Automated lead nurturing based on project progress
- Contact property updates from project activities
- Deal pipeline management with KVG stages
- Marketing automation triggers based on project events

**Analytics and Reporting:**
- ROI tracking for KVG services
- Customer lifecycle analysis
- Sales performance metrics integration
- Marketing campaign effectiveness measurement
- Customer satisfaction correlation with project outcomes

### ERP Integration

#### Financial Data Integration

**Project Costing:**
- Real-time cost tracking and budget management
- Purchase order integration for equipment procurement
- Invoice generation based on project milestones
- Resource allocation and time tracking
- Profitability analysis by project and service type

**Inventory Management:**
- Equipment availability checking
- Automated reorder triggers based on project demand
- Vendor management and pricing integration
- Warehouse location tracking
- Installation schedule optimization based on inventory

#### Microsoft Dynamics Integration

**Business Process Integration:**
- Quote-to-cash process automation
- Project accounting and financial reporting
- Resource planning and scheduling
- Customer service case management
- Contract lifecycle management

### External APIs and Services

#### Google Maps Platform Integration

**3D Photorealistic Mapping:**
- Photorealistic 3D Tiles API integration
- Interactive map controls (zoom, tilt, pan, rotate)
- Real-time satellite imagery updates
- Street view integration for site assessment
- Geographic coordinate management

**Location Services:**
- Address validation and geocoding
- Driving directions for field technicians
- Distance calculations for resource planning
- Territory management and optimization
- Location-based service recommendations

#### Weather and Environmental APIs

**Site Condition Monitoring:**
- Weather data integration for installation planning
- Environmental condition tracking
- Seasonal planning optimization
- Risk assessment based on weather patterns
- Installation delay prediction and mitigation

### Document Management Integration

#### Microsoft SharePoint Integration

**Document Storage:**
- Automatic document upload and organization
- Version control with approval workflows
- Metadata tagging for easy retrieval
- Access control based on project roles
- Search integration across document libraries

**Collaboration Features:**
- Real-time document collaboration
- Comment and review workflows
- Document check-in/check-out management
- Team site integration for project collaboration
- OneDrive synchronization for offline access

#### Box Integration

**Secure File Sharing:**
- Client portal for document sharing
- Watermarked document distribution
- Download tracking and analytics
- Expiration dates for sensitive documents
- Integration with mobile apps for field access

### Communication and Notification Systems

#### Microsoft Teams Integration

**Project Communication:**
- Automatic channel creation for new projects
- Progress notifications and updates
- File sharing integration
- Video conferencing for project reviews
- Bot integration for status queries

**Workflow Notifications:**
- Task assignments and reminders
- Milestone completion notifications
- Issue escalation alerts
- Approval request notifications
- Daily standup automation

#### Email System Integration

**Automated Communications:**
- Project status update emails
- Milestone notification emails
- Issue alert emails with context
- Report distribution automation
- Client communication templates

**Email Tracking:**
- Delivery confirmation tracking
- Open and click rate monitoring
- Response time measurement
- Email template performance analysis
- A/B testing for communication effectiveness

### Business Intelligence Integration

#### Power BI Integration

**Data Visualization:**
- Real-time dashboard creation from project data
- KPI tracking and performance measurement
- Trend analysis and forecasting
- Resource utilization optimization
- Customer analytics and segmentation

**Reporting Automation:**
- Scheduled report generation and distribution
- Executive briefing automation
- Performance scorecards
- Compliance reporting
- Financial analytics and profitability analysis

#### Tableau Integration

**Advanced Analytics:**
- Complex data relationship visualization
- Predictive analytics for project outcomes
- Geographic analysis and mapping
- Time series analysis for trend identification
- Statistical analysis for quality improvement

### Mobile Device Integration

#### Camera and Sensor Integration

**Device Capabilities:**
- GPS location tagging for site photos
- Accelerometer data for equipment orientation
- Compass integration for directional measurements
- Light sensor for automatic camera adjustments
- Proximity sensor for power management

**Augmented Reality (AR):**
- Equipment placement visualization using device camera
- Measurement tools using AR capabilities
- Installation guidance overlays
- Training simulations for complex procedures
- Quality assurance using AR verification

### Security and Compliance Integration

#### Identity Management Systems

**Active Directory Integration:**
- Single sign-on across all integrated systems
- Group-based access control
- Password policy enforcement
- Account lifecycle management
- Audit trail for access events

**Multi-Factor Authentication:**
- SMS-based verification
- Authenticator app integration
- Hardware token support
- Biometric authentication
- Risk-based authentication

#### Security Information and Event Management (SIEM)

**Security Monitoring:**
- Real-time event correlation
- Anomaly detection and alerting
- Incident response automation
- Compliance reporting
- Threat intelligence integration

This comprehensive specification provides the complete blueprint for recreating the security project management application with all required features, fields, and integration points.
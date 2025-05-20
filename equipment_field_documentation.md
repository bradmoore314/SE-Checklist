# Complete Equipment Field Documentation

This document provides a comprehensive breakdown of all equipment types, fields, and option sets in the application. It serves as a reference for understanding how each component in the system works and interconnects.

## Table of Contents

1. [Card Access Equipment](#card-access-equipment)
2. [Camera Equipment](#camera-equipment)
3. [Elevators and Turnstiles](#elevators-and-turnstiles)
4. [Miscellaneous Equipment](#miscellaneous-equipment)
5. [KVG (Kastle Video Guarding)](#kvg-kastle-video-guarding)
6. [Common Fields](#common-fields)
7. [Scope Information](#scope-information)
8. [Project-Level Fields](#project-level-fields)

---

## Card Access Equipment

### Access Points

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **type** | String | Type of access point | Options: "Door", "Gate", "Barrier", "Manhole", "Hatch" |
| **status** | String | Installation status | Options: "Planned", "Installed", "Needs Replacement", "Decommissioned" |
| **name** | String | Descriptive name | Text field, max 100 chars |
| **location** | String | Physical location | Text field, max 200 chars |
| **floor** | String | Building floor | Text field |
| **reader_type** | String | Type of reader | Options: "Proximity", "Smart Card", "Biometric", "Multi-Technology", "Mobile Credential" |
| **reader_model** | String | Specific model | Text field |
| **controller_type** | String | Control panel type | Options: "Kastle KMS", "Kastle K1", "Lenel", "S2", "Software House", "Other" |
| **controller_address** | String | Network/bus address | Text field |
| **panel_connection** | String | How reader connects | Options: "Direct", "IO Module", "Wireless" |
| **door_position_switch** | Boolean | Has door sensor | True/False |
| **rex_type** | String | Request to exit | Options: "Motion", "Push Button", "Crash Bar", "None" |
| **lock_type** | String | Lock hardware | Options: "Magnetic", "Electric Strike", "Electrified Panic", "Electrified Mortise", "Electric Bolt", "Other" |
| **mounting_height** | Float | Height of reader | Number in inches |
| **emergency_access** | String | Override method | Options: "Key Override", "Firefighter Access", "None" |
| **area_from** | String | Entry area | Text field |
| **area_to** | String | Exit area | Text field |
| **tailgate_detection** | Boolean | Has anti-tailgate | True/False |
| **security_level** | String | Security classification | Options: "Perimeter", "Internal", "High-Security", "Critical" |
| **notes** | Text | Additional details | Text field |
| **power_source** | String | How device is powered | Options: "Local Power Supply", "PoE", "Controller Powered", "Other" |
| **backup_power** | Boolean | Has battery backup | True/False |
| **scheduled_unlock** | Boolean | Auto-unlock capability | True/False |
| **alarm_shunt** | Boolean | Bypasses alarm | True/False |
| **hardware_vendor** | String | Equipment supplier | Text field |
| **maintenance_date** | Date | Last service date | Date field |
| **maintenance_due** | Date | Next service date | Date field |
| **resolved_from_ui** | Boolean | Manual resolution flag | True/False |

### Credential Readers

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **mounting_type** | String | How reader is mounted | Options: "Mullion", "Single-gang", "Pedestal", "Door Frame", "Custom" |
| **weather_resistant** | Boolean | Outdoor rated | True/False |
| **mullion_size** | String | If mullion mounted | Text field with dimensions |
| **tamper_detection** | Boolean | Reports tampering | True/False |
| **visual_indicators** | String | Lights/display | Options: "LED", "LCD Display", "None" |
| **audio_indicators** | Boolean | Sounds/beeps | True/False |
| **backlit_keypad** | Boolean | Illuminated keys | True/False |
| **communication_protocol** | String | Reader protocol | Options: "Wiegand", "OSDP", "RS-485", "Other" |
| **encryption_type** | String | Security protocol | Options: "Standard", "High Encryption", "None" |
| **card_technology** | String | Card compatibility | Options: "125 kHz", "13.56 MHz", "BLE", "NFC", "Multi" |
| **custom_programming** | Boolean | Specialty config | True/False |

## Camera Equipment

### Cameras

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **type** | String | Camera type | Options: "Fixed", "PTZ", "Multi-Sensor", "Fisheye", "Specialty" |
| **status** | String | Installation status | Options: "Planned", "Installed", "Needs Replacement", "Decommissioned" |
| **name** | String | Descriptive name | Text field, max 100 chars |
| **location** | String | Physical location | Text field, max 200 chars |
| **floor** | String | Building floor | Text field |
| **manufacturer** | String | Camera maker | Text field |
| **model** | String | Specific model | Text field |
| **resolution** | String | Video resolution | Options: "SD", "HD", "Full HD", "4K", "5MP", "8MP", "12MP", "Other" |
| **lens_type** | String | Lens configuration | Options: "Fixed", "Varifocal", "Zoom", "Fisheye" |
| **lens_focal_length** | String | Focal length | Text field (mm) |
| **mounting_type** | String | How camera is mounted | Options: "Ceiling", "Wall", "Pole", "Corner", "Pendant", "Recessed" |
| **mounting_height** | Float | Height from floor/ground | Number in feet |
| **indoor_outdoor** | String | Environment | Options: "Indoor", "Outdoor", "Indoor/Outdoor" |
| **ip_rating** | String | Ingress protection | Text field (IP code) |
| **vandal_resistant** | Boolean | Hardened housing | True/False |
| **day_night** | Boolean | Low light capability | True/False |
| **ir_illumination** | Boolean | Infrared LEDs | True/False |
| **ir_distance** | Integer | IR range | Number in feet |
| **power_type** | String | Power source | Options: "PoE", "12VDC", "24VAC", "PoE+", "Other" |
| **poe_type** | String | PoE standard | Options: "802.3af", "802.3at", "802.3bt", "Passive", "N/A" |
| **storage_type** | String | Recording location | Options: "NVR", "Cloud", "Edge", "Hybrid" |
| **retention_days** | Integer | Days to keep footage | Number of days |
| **analytics** | String | Built-in features | Options: "Motion Detection", "Line Crossing", "Object Classification", "Face Detection", "LPR", "Multiple", "None" |
| **onvif_compliant** | Boolean | Industry standard | True/False |
| **network_address** | String | IP address | Text field |
| **viewing_angle_h** | Float | Horizontal FOV | Number in degrees |
| **viewing_angle_v** | Float | Vertical FOV | Number in degrees |
| **recording_fps** | Integer | Frames per second | Number (FPS) |
| **min_illumination** | String | Low light sensitivity | Text field (lux) |
| **dynamic_range** | String | WDR capability | Text field (dB) |
| **audio** | Boolean | Audio capability | True/False |
| **audio_type** | String | Audio specification | Options: "One-way", "Two-way", "None" |
| **maintenance_date** | Date | Last service date | Date field |
| **notes** | Text | Additional details | Text field |
| **resolved_from_ui** | Boolean | Manual resolution flag | True/False |

### Camera Monitoring

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **camera_id** | Integer | Reference to camera | Foreign key |
| **monitoring_type** | String | Who monitors | Options: "KVG", "On-site Security", "Unmonitored", "Hybrid" |
| **schedule_type** | String | When monitored | Options: "24/7", "After Hours", "Business Hours", "Custom", "On Demand" |
| **schedule_start** | Time | Start time if custom | Time field |
| **schedule_end** | Time | End time if custom | Time field |
| **alert_types** | String | What triggers alerts | Options: "Motion", "Line Crossing", "Loitering", "Custom Analytics", "Multiple" |
| **response_priority** | String | Alert importance | Options: "High", "Medium", "Low" |
| **video_verification** | Boolean | Pre-dispatch verification | True/False |

### Camera FOV (Field of View)

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **camera_id** | Integer | Reference to camera | Foreign key |
| **angle** | Float | Camera rotation | Number in degrees |
| **coverage_purpose** | String | Primary objective | Options: "General Surveillance", "Entrance Monitoring", "License Plate", "Face Capture", "Situational Awareness" |
| **primary_target** | String | Main view focus | Options: "Door", "Hallway", "Perimeter", "Parking", "Public Area", "Other" |
| **fov_diagram** | File | Visual representation | Image file |
| **effective_range** | Float | Useful view distance | Number in feet |
| **visibility_obstructions** | Text | Blocking elements | Text field |
| **area_access_frequency** | String | Traffic level | Options: "High", "Medium", "Low", "Restricted" |
| **fov_area_accessibility** | String | Security level | Options: "Public", "Employee Only", "Restricted", "Critical" |

## Elevators and Turnstiles

### Elevators

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **status** | String | Installation status | Options: "Planned", "Installed", "Needs Replacement", "Decommissioned" |
| **name** | String | Descriptive name | Text field, max 100 chars |
| **location** | String | Physical location | Text field, max 200 chars |
| **elevator_bank** | String | Grouping | Text field |
| **type** | String | Elevator type | Options: "Passenger", "Service", "Freight", "Shuttle" |
| **floors_served** | String | Floor range | Text field |
| **access_control_type** | String | Restriction method | Options: "Card Reader", "Destination Dispatch", "Key Switch", "None" |
| **reader_location** | String | Where readers are | Options: "Cab", "Hall Call", "Both", "None" |
| **reader_type** | String | Type of reader | Options: "Proximity", "Smart Card", "Biometric", "Multi-Technology", "Mobile Credential" |
| **controller_type** | String | Control system | Options: "Kastle KMS", "Kastle K1", "Elevator Manufacturer", "Other" |
| **fire_service** | Boolean | Emergency control | True/False |
| **emergency_power** | Boolean | Backup power | True/False |
| **camera_present** | Boolean | Has surveillance | True/False |
| **camera_id** | Integer | Reference to camera | Foreign key |
| **intercom_present** | Boolean | Has intercom | True/False |
| **maintenance_company** | String | Service provider | Text field |
| **maintenance_date** | Date | Last service date | Date field |
| **notes** | Text | Additional details | Text field |

### Turnstiles

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **status** | String | Installation status | Options: "Planned", "Installed", "Needs Replacement", "Decommissioned" |
| **name** | String | Descriptive name | Text field, max 100 chars |
| **location** | String | Physical location | Text field, max 200 chars |
| **floor** | String | Building floor | Text field |
| **type** | String | Turnstile type | Options: "Optical", "Tripod", "Full-Height", "Swing Gate", "Speed Gate" |
| **manufacturer** | String | Turnstile maker | Text field |
| **model** | String | Specific model | Text field |
| **lane_width** | Float | Width of passage | Number in inches |
| **throughput_rate** | Integer | People per minute | Number |
| **tailgating_detection** | Boolean | Detects unauthorized entry | True/False |
| **reader_type** | String | Type of reader | Options: "Proximity", "Smart Card", "Biometric", "Multi-Technology", "Mobile Credential" |
| **reader_location** | String | Where readers are | Options: "Entry Side", "Exit Side", "Both Sides" |
| **bidirectional** | Boolean | Works both ways | True/False |
| **ada_compliant** | Boolean | Accessibility | True/False |
| **ada_gate_present** | Boolean | Accessible alternative | True/False |
| **emergency_egress** | String | Exit during emergency | Options: "Fail Safe", "Battery Backup", "Mechanical Release" |
| **cabinet_material** | String | Construction material | Options: "Stainless Steel", "Powder Coated", "Glass", "Custom" |
| **barrier_type** | String | Physical barrier | Options: "Swing", "Retractable", "Drop Arm", "Glass Panels", "None" |
| **barrier_height** | Float | Height of barrier | Number in inches |
| **power_requirements** | String | Electrical needs | Text field |
| **maintenance_company** | String | Service provider | Text field |
| **maintenance_date** | Date | Last service date | Date field |
| **notes** | Text | Additional details | Text field |

## Miscellaneous Equipment

### Intrusion Detection

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **status** | String | Installation status | Options: "Planned", "Installed", "Needs Replacement", "Decommissioned" |
| **name** | String | Descriptive name | Text field, max 100 chars |
| **location** | String | Physical location | Text field, max 200 chars |
| **floor** | String | Building floor | Text field |
| **type** | String | Sensor type | Options: "Motion Detector", "Glass Break", "Door Contact", "Duress Button", "Other" |
| **model** | String | Specific model | Text field |
| **zone** | String | Alarm zone | Text field |
| **panel_type** | String | Control panel | Options: "Kastle KMS", "Kastle K1", "DSC", "Honeywell", "Bosch", "Other" |
| **panel_connection** | String | Connection method | Options: "Hardwired", "Wireless", "Hybrid" |
| **24hr_zone** | Boolean | Always armed | True/False |
| **entry_exit** | Boolean | Has entry delay | True/False |
| **mounting_height** | Float | Height from floor | Number in feet |
| **coverage_area** | Float | Detection range | Number in feet |
| **sensitivity_adjustable** | Boolean | Configurable | True/False |
| **pet_immune** | Boolean | Ignores small animals | True/False |
| **tamper_protection** | Boolean | Reports tampering | True/False |
| **power_source** | String | How device is powered | Options: "Panel", "Local", "Battery" |
| **maintenance_date** | Date | Last service date | Date field |
| **notes** | Text | Additional details | Text field |

### Emergency Communication

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **status** | String | Installation status | Options: "Planned", "Installed", "Needs Replacement", "Decommissioned" |
| **name** | String | Descriptive name | Text field, max 100 chars |
| **location** | String | Physical location | Text field, max 200 chars |
| **floor** | String | Building floor | Text field |
| **type** | String | Device type | Options: "Emergency Phone", "Intercom", "Call Box", "Mass Notification", "Duress Button" |
| **manufacturer** | String | Device maker | Text field |
| **model** | String | Specific model | Text field |
| **mounting_type** | String | How device is mounted | Options: "Wall", "Pedestal", "Recessed", "Desk", "Other" |
| **ada_compliant** | Boolean | Accessibility | True/False |
| **audio_visual** | String | Indicators | Options: "Audio Only", "Visual Only", "Both" |
| **connection_type** | String | Communication method | Options: "Analog", "VoIP", "Cellular", "Radio" |
| **monitoring_type** | String | Who responds | Options: "On-site", "Central Station", "Local Emergency Services", "KVG" |
| **backup_power** | Boolean | Has battery backup | True/False |
| **maintenance_date** | Date | Last service date | Date field |
| **notes** | Text | Additional details | Text field |

### Specialty Systems

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **status** | String | Installation status | Options: "Planned", "Installed", "Needs Replacement", "Decommissioned" |
| **name** | String | Descriptive name | Text field, max 100 chars |
| **location** | String | Physical location | Text field, max 200 chars |
| **floor** | String | Building floor | Text field |
| **type** | String | System type | Options: "Biometric", "Weapon Detection", "License Plate Recognition", "Anti-Drone", "Visitor Management", "Other" |
| **manufacturer** | String | System maker | Text field |
| **model** | String | Specific model | Text field |
| **coverage_area** | String | Detection zone | Text field |
| **integration_type** | String | System connections | Options: "Standalone", "Access Control", "VMS", "Custom" |
| **power_requirements** | String | Electrical needs | Text field |
| **maintenance_company** | String | Service provider | Text field |
| **maintenance_date** | Date | Last service date | Date field |
| **notes** | Text | Additional details | Text field |

## KVG (Kastle Video Guarding)

### KVG Configuration

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **project_id** | Integer | Associated project | Foreign key |
| **service_level** | String | Monitoring package | Options: "Basic", "Standard", "Premium", "Custom" |
| **total_camera_streams** | Integer | Number of feeds | Numeric value |
| **monitoring_hours_type** | String | When monitored | Options: "24/7", "After Hours", "Business Hours", "Custom" |
| **custom_schedule_start** | Time | Start time if custom | Time field |
| **custom_schedule_end** | Time | End time if custom | Time field |
| **weekend_monitoring** | Boolean | Includes weekends | True/False |
| **holiday_monitoring** | Boolean | Includes holidays | True/False |
| **video_storage_days** | Integer | Retention period | Number of days |
| **response_protocol** | Text | Action procedures | Text field |
| **primary_contact_name** | String | Main contact | Text field |
| **primary_contact_phone** | String | Contact number | Text field |
| **primary_contact_email** | String | Contact email | Text field |
| **backup_contact_name** | String | Secondary contact | Text field |
| **backup_contact_phone** | String | Contact number | Text field |
| **backup_contact_email** | String | Contact email | Text field |
| **notes** | Text | Additional details | Text field |

### Video Stream

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **kvg_config_id** | Integer | Parent configuration | Foreign key |
| **camera_id** | Integer | Associated camera | Foreign key |
| **stream_name** | String | Descriptive name | Text field, max 100 chars |
| **monitoring_priority** | String | Importance level | Options: "High", "Medium", "Low" |
| **stream_resolution** | String | Video quality | Options: "HD", "Full HD", "4K", "Custom" |
| **custom_resolution** | String | If not standard | Text field |
| **frame_rate** | Integer | FPS setting | Number (FPS) |
| **bandwidth_requirement** | Float | Network needs | Number in Mbps |
| **alert_conditions** | String | Triggering events | Options: "Motion", "Line Crossing", "Loitering", "Object Classification", "Multiple" |
| **action_on_alert** | String | Response type | Options: "Notification Only", "Live Verification", "Voice Down", "Dispatch", "Custom" |
| **schedule_override** | Boolean | Different from main | True/False |
| **custom_schedule_start** | Time | Start time if custom | Time field |
| **custom_schedule_end** | Time | End time if custom | Time field |
| **special_instructions** | Text | Custom notes | Text field |

### Event Monitoring

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **kvg_config_id** | Integer | Parent configuration | Foreign key |
| **event_type** | String | Type of monitoring | Options: "Regular", "Special Event", "Construction", "Temporary" |
| **event_name** | String | Descriptive name | Text field, max 100 chars |
| **start_date** | Date | Event begins | Date field |
| **end_date** | Date | Event ends | Date field |
| **start_time** | Time | Daily start time | Time field |
| **end_time** | Time | Daily end time | Time field |
| **camera_streams** | Array | Cameras to monitor | Array of camera IDs |
| **custom_protocols** | Text | Special procedures | Text field |
| **authorized_personnel** | Text | Allowed people list | Text field |
| **event_contact_name** | String | Event contact | Text field |
| **event_contact_phone** | String | Contact number | Text field |

## Common Fields
These fields are shared across multiple equipment types:

### Equipment Base Fields

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **project_id** | Integer | Parent project | Foreign key |
| **status** | String | Installation status | Common options across equipment |
| **name** | String | Descriptive name | Text field, max 100 chars |
| **location** | String | Physical location | Text field, max 200 chars |
| **floor** | String | Building floor | Text field |
| **notes** | Text | Additional details | Text field |
| **created_at** | DateTime | Creation timestamp | Auto-generated |
| **updated_at** | DateTime | Last update | Auto-generated |
| **created_by** | Integer | User who created | Foreign key |
| **updated_by** | Integer | User who updated | Foreign key |

## Scope Information

### Scope Items

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **project_id** | Integer | Parent project | Foreign key |
| **equipment_type** | String | Type category | All equipment categories |
| **equipment_count** | Integer | Quantity | Numeric value |
| **equipment_status** | String | Installation phase | Options: "Planned", "In Progress", "Complete", "On Hold" |
| **scope_description** | Text | Detailed description | Text field |
| **estimated_cost** | Float | Budget amount | Currency value |
| **approved_budget** | Float | Authorized amount | Currency value |
| **start_date** | Date | Work begins | Date field |
| **completion_date** | Date | Work ends | Date field |
| **responsible_party** | String | Who performs work | Text field |
| **priority_level** | String | Importance | Options: "Critical", "High", "Medium", "Low" |
| **dependencies** | Text | Related requirements | Text field |
| **scope_notes** | Text | Additional details | Text field |

### Scope Categories

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **project_id** | Integer | Parent project | Foreign key |
| **category_name** | String | Scope grouping | Text field, max 100 chars |
| **category_description** | Text | Category details | Text field |
| **is_active** | Boolean | Currently used | True/False |

## Project-Level Fields

### Project Base Information

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **name** | String | Project name | Text field, max 100 chars |
| **client_name** | String | Customer name | Text field |
| **client_id** | Integer | Customer ID | Foreign key |
| **address** | String | Physical location | Text field |
| **city** | String | City | Text field |
| **state** | String | State/Province | Text field |
| **zip_code** | String | Postal code | Text field |
| **country** | String | Country | Text field |
| **status** | String | Project status | Options: "Planning", "Active", "On Hold", "Complete", "Archived" |
| **start_date** | Date | Project begins | Date field |
| **target_completion** | Date | Target end date | Date field |
| **actual_completion** | Date | Actual end date | Date field |
| **project_manager** | String | PM name | Text field |
| **project_type** | String | Classification | Options: "New Construction", "Renovation", "Upgrade", "Assessment", "Maintenance" |
| **square_footage** | Integer | Building size | Numeric value |
| **number_of_floors** | Integer | Floor count | Numeric value |
| **building_type** | String | Building class | Options: "Office", "Residential", "Mixed-Use", "Retail", "Industrial", "Healthcare", "Education", "Government", "Other" |
| **occupancy_type** | String | Usage pattern | Options: "24/7", "Business Hours", "Multi-Shift", "Variable" |
| **security_level** | String | Security need | Options: "Basic", "Enhanced", "High", "Government/Regulated" |
| **budget_total** | Float | Total budget | Currency value |
| **notes** | Text | Additional details | Text field |
| **created_at** | DateTime | Creation timestamp | Auto-generated |
| **updated_at** | DateTime | Last update | Auto-generated |

### Project Contacts

| Field | Type | Description | Options/Constraints |
|-------|------|-------------|---------------------|
| **id** | Integer | Unique identifier | Auto-generated |
| **project_id** | Integer | Parent project | Foreign key |
| **name** | String | Contact name | Text field |
| **title** | String | Job title | Text field |
| **company** | String | Organization | Text field |
| **phone** | String | Phone number | Text field |
| **email** | String | Email address | Text field |
| **role** | String | Project role | Options: "Client", "Project Manager", "Architect", "Contractor", "Security Director", "Facility Manager", "IT Contact", "Other" |
| **primary_contact** | Boolean | Main contact | True/False |
| **notes** | Text | Additional info | Text field |

---

## Field Relationships and Integration Points

The application integrates these various equipment types and fields through several key mechanisms:

1. **Project Structure**: All equipment is associated with specific projects, providing organizational context.

2. **Floorplan Integration**: Equipment placement on floorplans creates spatial relationships between different security elements.

3. **Equipment Dependencies**: Many equipment types reference other equipment (e.g., elevators can reference cameras).

4. **KVG Monitoring**: The KVG configuration ties together specific cameras for remote monitoring services.

5. **AI Analysis**: All equipment data feeds into the AI assessment tools that identify security gaps and optimization opportunities.

6. **Equipment Scheduling**: Each equipment type connects to installation and maintenance schedules.

7. **User Permissions**: Different user roles have varying access levels to equipment data and configurations.

8. **Reporting**: All equipment fields can be included in comprehensive security assessment reports and site walk documentation.

This interconnected system allows for comprehensive security planning, implementation tracking, and ongoing maintenance across all equipment categories.
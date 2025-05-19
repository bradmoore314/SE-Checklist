import React, { useState } from 'react';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const DocumentationPage = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const guides = [
    {
      id: 1,
      title: 'Getting Started',
      description: 'Learn how to create your first site walk project.',
      category: 'basics',
      content: `
        <h2 class="text-2xl font-bold mb-4">Getting Started with Checklist Wizard</h2>
        <p class="mb-4">Welcome to the Checklist Wizard application! This comprehensive tool helps security professionals manage and track equipment during site walks, replacing traditional Excel-based tracking systems with a digital solution that captures detailed equipment information.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Creating a New Project</h3>
        <p class="mb-4">To create a new project:</p>
        <ol class="list-decimal ml-6 mb-4">
          <li>Click the "New Site Walk" button in the top navigation bar</li>
          <li>Fill out the project details form with the following information:
            <ul class="list-disc ml-6 mb-2 mt-2">
              <li><strong>Client Name:</strong> Your client's organization name</li>
              <li><strong>Site Address:</strong> The physical location of the site walk</li>
              <li><strong>Project Name:</strong> A descriptive name for your project</li>
              <li><strong>Sales Engineer:</strong> The SE assigned to the project</li>
              <li><strong>BDM:</strong> Business Development Manager for the project</li>
            </ul>
          </li>
          <li>Click "Create Project" to save your new project</li>
        </ol>
        <p class="mb-4">Once created, your project will appear in the Projects list where you can access it at any time.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Project Dashboard</h3>
        <p class="mb-4">The project dashboard provides an overview of your project with the following information:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Project Details:</strong> Client name, site address, and other basic information</li>
          <li><strong>Progress Tracking:</strong> Visual indicators of project completion status</li>
          <li><strong>Equipment Summary:</strong> Counts of different equipment types added to the project</li>
          <li><strong>Recent Activity:</strong> Timeline of recent changes and additions</li>
          <li><strong>Quick Actions:</strong> Buttons for common tasks like adding equipment or generating reports</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Navigation</h3>
        <p class="mb-4">The application uses a sidebar navigation system organized into several sections:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Opportunities:</strong> Access all your projects and create new ones</li>
          <li><strong>Equipment:</strong> Manage different types of security equipment including Card Access, Cameras, Elevators & Turnstiles, Intercoms, and Kastle Video Guarding</li>
          <li><strong>Floorplans:</strong> Upload and annotate building floorplans</li>
          <li><strong>Reports:</strong> Generate Door Schedules, Camera Schedules, and Project Summaries</li>
          <li><strong>Settings:</strong> Configure application preferences and integrations</li>
        </ul>
      `
    },
    {
      id: 2,
      title: 'Equipment Management',
      description: 'How to add and configure different types of security equipment.',
      category: 'core',
      content: `
        <h2 class="text-2xl font-bold mb-4">Equipment Management</h2>
        <p class="mb-4">Checklist Wizard provides comprehensive tools for managing all types of security equipment in your projects. Each equipment type has its own dedicated interface for adding, editing, and tracking specific details.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Card Access Points</h3>
        <p class="mb-4">The Card Access tab allows you to manage access control points such as doors, gates, and barriers:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Adding Access Points:</strong> Click "Add New Access Point" and complete the two-step process:
            <ol class="list-decimal ml-6 mb-2 mt-2">
              <li><strong>Step 1:</strong> Enter access point details including location, reader type, lock type, monitoring type, and additional configuration options</li>
              <li><strong>Step 2:</strong> Upload images of the access point to document its current state and placement</li>
            </ol>
          </li>
          <li><strong>Quick Configuration:</strong> Use pre-defined templates for common setups like "Standard Interior Door" or "Card Reader with REX"</li>
          <li><strong>Takeover Options:</strong> Specify if you're taking over existing equipment and its current state</li>
          <li><strong>Bulk Operations:</strong> Select multiple access points to perform batch operations like duplication or deletion</li>
          <li><strong>Filtering and Sorting:</strong> Easily find specific access points using search filters and sorting options</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Cameras</h3>
        <p class="mb-4">The Cameras tab provides tools for documenting and configuring surveillance cameras:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Adding Cameras:</strong> Click "Add New Camera" to document camera details including:
            <ul class="list-disc ml-6 mb-2 mt-2">
              <li>Location and mounting type</li>
              <li>Camera type, resolution, and field of view</li>
              <li>Indoor/outdoor designation</li>
              <li>Power source and special requirements</li>
            </ul>
          </li>
          <li><strong>Image Upload:</strong> Attach images showing the camera location, views, and mounting details</li>
          <li><strong>Gateway Assignment:</strong> Associate cameras with specific gateway devices for network organization</li>
          <li><strong>View Management:</strong> Document what each camera is intended to capture</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Elevators & Turnstiles</h3>
        <p class="mb-4">Manage elevator control systems and turnstiles with specialized configuration options:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Elevator Configuration:</strong> Document control panel locations, floor access restrictions, and integration details</li>
          <li><strong>Turnstile Setup:</strong> Configure entry/exit patterns, access control integration, and physical dimensions</li>
          <li><strong>Compliance Features:</strong> Track ADA compliance requirements and implementation details</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Intercoms</h3>
        <p class="mb-4">Configure intercom systems with detailed specification options:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Intercom Types:</strong> Audio-only, video, or integrated systems</li>
          <li><strong>Connectivity:</strong> Document network requirements, VoIP integration, or standalone systems</li>
          <li><strong>Access Control Integration:</strong> Configure how intercoms interact with door release mechanisms</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Kastle Video Guarding</h3>
        <p class="mb-4">Set up and configure Kastle Video Guarding services:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Camera Stream Configuration:</strong> Connect cameras to KVG gateways</li>
          <li><strong>Event Monitoring Setup:</strong> Configure alert triggers and response protocols</li>
          <li><strong>Patrol Group Organization:</strong> Create logical groupings of cameras for virtual guard tours</li>
          <li><strong>Gateway Calculator:</strong> Automatically determine optimal gateway configuration based on camera count and bandwidth requirements</li>
        </ul>
      `
    },
    {
      id: 3,
      title: 'Enhanced Floorplan Management',
      description: 'Advanced PDF annotation and equipment positioning.',
      category: 'advanced',
      content: `
        <h2 class="text-2xl font-bold mb-4">Enhanced Floorplan Management</h2>
        <p class="mb-4">Checklist Wizard features a professional-grade floorplan annotation system that allows you to precisely place and manage security equipment on building floorplans.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Uploading Floorplans</h3>
        <p class="mb-4">To add floorplans to your project:</p>
        <ol class="list-decimal ml-6 mb-4">
          <li>Navigate to the Floorplans section of your project</li>
          <li>Click the "Upload Floorplan" button</li>
          <li>Select a PDF file from your computer (multi-page PDFs are supported)</li>
          <li>Enter a name and description for the floorplan</li>
          <li>Specify the floor number or designation (e.g., "1st Floor", "Basement")</li>
          <li>Click "Upload" to process the floorplan</li>
        </ol>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Advanced Annotation Tools</h3>
        <p class="mb-4">The floorplan viewer includes professional annotation capabilities:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Precise Zoom Controls:</strong> Zoom in/out with mouse wheel or pinch gestures with configurable zoom levels</li>
          <li><strong>Pan Navigation:</strong> Click and drag to move around the floorplan</li>
          <li><strong>Multi-Page Support:</strong> Navigate between different pages/floors with the page selection controls</li>
          <li><strong>Layer Management:</strong> Toggle visibility of different equipment types for clearer visualization</li>
          <li><strong>Marker Placement:</strong> Add equipment markers with precise positioning that maintains coordinates during zoom operations</li>
          <li><strong>PDF Rendering:</strong> High-fidelity rendering that preserves document quality even at high zoom levels</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Adding Equipment Markers</h3>
        <p class="mb-4">To place equipment on a floorplan:</p>
        <ol class="list-decimal ml-6 mb-4">
          <li>Open the floorplan viewer for your project</li>
          <li>Navigate to the appropriate floor/page</li>
          <li>Click the "Add Marker" button or use the right-click context menu</li>
          <li>Select the marker position on the floorplan</li>
          <li>Choose the equipment type (Access Point, Camera, Elevator, Intercom)</li>
          <li>Select the specific equipment item from your project's inventory</li>
          <li>Adjust the marker position if needed by dragging it</li>
          <li>Save the marker to create the association</li>
        </ol>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Marker Types and Visual Indicators</h3>
        <p class="mb-4">The system uses color-coded markers to represent different equipment types:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Access Points:</strong> Blue markers with different shapes for interior/perimeter doors</li>
          <li><strong>Cameras:</strong> Red markers with directional indicators showing field of view</li>
          <li><strong>Elevators:</strong> Green markers with elevator icons</li>
          <li><strong>Intercoms:</strong> Purple markers with communication symbols</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Bidirectional Synchronization</h3>
        <p class="mb-4">The system maintains perfect synchronization between equipment lists and floorplan markers:</p>
        <ul class="list-disc ml-6 mb-4">
          <li>Adding a marker to a floorplan automatically updates the equipment's location data</li>
          <li>Deleting equipment from a list removes its markers from all floorplans</li>
          <li>Moving a marker updates the equipment's location details</li>
          <li>The system runs consistency checks to ensure marker counts match equipment inventory</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Exporting Annotated Floorplans</h3>
        <p class="mb-4">Generate professional documentation with annotated floorplans:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>PDF Export:</strong> Save annotated floorplans as new PDFs with all equipment markers included</li>
          <li><strong>Print Support:</strong> Print directly from the application with proper scaling</li>
          <li><strong>Equipment Legends:</strong> Automatically generated legends that explain marker types and counts</li>
          <li><strong>Customizable Titles and Headers:</strong> Add project information and company branding to exports</li>
        </ul>
      `
    },
    {
      id: 4,
      title: 'Export & Reporting',
      description: 'Comprehensive export options and report generation.',
      category: 'advanced',
      content: `
        <h2 class="text-2xl font-bold mb-4">Export & Reporting</h2>
        <p class="mb-4">Checklist Wizard provides robust export and reporting capabilities to generate professional documentation and data extracts in multiple formats.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Available Export Formats</h3>
        <p class="mb-4">The application supports exporting data in the following formats:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>PDF:</strong> Professional-quality documentation with embedded images and formatted tables</li>
          <li><strong>Excel (.xlsx):</strong> Structured spreadsheets with multiple tabs for different equipment types</li>
          <li><strong>CSV:</strong> Simple data extracts for importing into other systems</li>
          <li><strong>JSON:</strong> Machine-readable format for developers and API integration</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Door Schedule Export</h3>
        <p class="mb-4">Generate comprehensive door schedules with all access point details:</p>
        <ol class="list-decimal ml-6 mb-4">
          <li>Navigate to the "Card Access" equipment page</li>
          <li>Use the "Export to Excel" button in the top right corner of the equipment list</li>
          <li>The export includes all door schedule information in the Kastle format:</li>
          <ul class="list-disc ml-6 mb-2 mt-2">
            <li>Door number and location</li>
            <li>Reader and lock type information</li>
            <li>Installation details and monitoring options</li>
            <li>All notes and technical specifications</li>
          </ul>
        </ol>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Camera Schedule Export</h3>
        <p class="mb-4">Create detailed camera schedules with configuration information:</p>
        <ol class="list-decimal ml-6 mb-4">
          <li>Navigate to the "Cameras" equipment page</li>
          <li>Use the "Export to Excel" button in the top right corner of the equipment list</li>
          <li>The export includes all camera details in the standard format:</li>
          <ul class="list-disc ml-6 mb-2 mt-2">
            <li>Camera device number and name</li>
            <li>Camera type, model and location</li>
            <li>Technical specifications including power source and mounting</li>
            <li>Network settings and additional configuration notes</li>
          </ul>
        </ol>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Project Summary Reports</h3>
        <p class="mb-4">Generate comprehensive project documentation:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Executive Summary:</strong> High-level overview of the project scope and equipment counts</li>
          <li><strong>Detailed Equipment Inventory:</strong> Complete listing of all equipment with specifications</li>
          <li><strong>Cost Summary:</strong> Equipment and labor cost breakdown (if pricing is enabled)</li>
          <li><strong>Installation Timeline:</strong> Project schedule with milestone dates</li>
          <li><strong>Site Photographs:</strong> Organized collection of all uploaded images with captions</li>
          <li><strong>Annotated Floorplans:</strong> PDF exports of all floorplans with equipment markers</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">PDF Output Customization</h3>
        <p class="mb-4">Personalize PDF reports with your company branding:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Logo Placement:</strong> Add your company logo to headers and title pages</li>
          <li><strong>Custom Color Schemes:</strong> Apply your brand colors to report elements</li>
          <li><strong>Cover Page Templates:</strong> Choose from several professional cover page designs</li>
          <li><strong>Header and Footer Customization:</strong> Add project information, page numbers, and dates</li>
          <li><strong>Document Security:</strong> Apply password protection or digital signatures to PDFs</li>
        </ul>
      `
    },
    {
      id: 5,
      title: 'Artificial Intelligence Features',
      description: 'Azure OpenAI integration for intelligent assistance and automation in a secure environment.',
      category: 'advanced',
      content: `
        <h2 class="text-2xl font-bold mb-4">Artificial Intelligence Features</h2>
        <p class="mb-4">Checklist Wizard integrates with Microsoft's Azure OpenAI in Kastle's secure environment to provide advanced automation and intelligent assistance throughout the application, ensuring complete data security and compliance.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Azure OpenAI Integration</h3>
        <p class="mb-4">The application leverages Azure's enterprise-grade OpenAI service for various intelligent features with enhanced security:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Natural Language Processing:</strong> Understand and generate human-like text for reports and documentation</li>
          <li><strong>Image Analysis:</strong> Recognize and interpret visual information from uploaded photographs</li>
          <li><strong>Predictive Analysis:</strong> Offer recommendations based on project data and patterns</li>
          <li><strong>Multi-Modal Understanding:</strong> Process both text and visual inputs simultaneously</li>
          <li><strong>Multi-Language Support:</strong> Translate content between languages while preserving technical accuracy</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">AI Chatbot Assistant</h3>
        <p class="mb-4">The integrated chatbot provides conversational assistance for various tasks:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Natural Language Equipment Configuration:</strong> Add and configure equipment through conversation</li>
          <li><strong>Voice Interaction:</strong> Speak commands and descriptions instead of typing</li>
          <li><strong>Contextual Help:</strong> Get specific guidance for the current task or screen</li>
          <li><strong>Project Analysis:</strong> Ask questions about your project data and receive intelligent summaries</li>
          <li><strong>Technical Recommendations:</strong> Get suggestions for optimal equipment placement and configuration</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Smart Image Analysis</h3>
        <p class="mb-4">Automatically extract information from photographs and scans:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Equipment Identification:</strong> Recognize security devices in photographs</li>
          <li><strong>Existing Hardware Analysis:</strong> Identify current lock types, reader models, and other hardware components</li>
          <li><strong>Damage Assessment:</strong> Detect and document existing damage or maintenance issues</li>
          <li><strong>Measurement Estimation:</strong> Approximate dimensions from images with reference objects</li>
          <li><strong>Text Recognition:</strong> Extract model numbers, serial numbers, and other text from equipment labels</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">AI-Generated Documentation</h3>
        <p class="mb-4">Create professional documentation with AI assistance:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Scope of Work Generation:</strong> Create detailed SOW documents based on project data</li>
          <li><strong>Multi-Language Translation:</strong> Translate technical documentation while preserving security terminology accuracy</li>
          <li><strong>Meeting Agenda Creator:</strong> Generate structured agendas for client meetings based on project status</li>
          <li><strong>Technical Guide Creation:</strong> Produce custom installation and configuration guides for technicians</li>
          <li><strong>Executive Summary Generation:</strong> Create concise project overviews for management presentations</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Security System Analysis</h3>
        <p class="mb-4">Receive intelligent insights about your security design:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Coverage Analysis:</strong> Identify potential gaps in camera or access control coverage</li>
          <li><strong>Compliance Checking:</strong> Evaluate designs against industry standards and requirements</li>
          <li><strong>Gateway Configuration Optimization:</strong> Automatically calculate optimal gateway assignments for cameras</li>
          <li><strong>Equipment Recommendations:</strong> Suggest appropriate equipment types based on location characteristics</li>
          <li><strong>Network Infrastructure Assessment:</strong> Evaluate bandwidth and connectivity requirements</li>
        </ul>
      `
    },
    {
      id: 6,
      title: 'Integration Capabilities',
      description: 'Connect with external systems and services.',
      category: 'integrations',
      content: `
        <h2 class="text-2xl font-bold mb-4">Integration Capabilities</h2>
        <p class="mb-4">Checklist Wizard offers robust integration options with external systems and services to enhance functionality and streamline workflows.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Microsoft 365 Integration</h3>
        <p class="mb-4">Connect with Microsoft services for enhanced productivity:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Microsoft Authentication:</strong> Sign in with your Microsoft account credentials</li>
          <li><strong>Outlook Calendar:</strong> Schedule site walks and meetings with automatic calendar entries</li>
          <li><strong>Email Integration:</strong> Send reports and documentation directly from the application</li>
          <li><strong>SharePoint Storage:</strong> Save project files and reports to SharePoint document libraries</li>
          <li><strong>Teams Notifications:</strong> Receive alerts and updates in Microsoft Teams</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">CRM System Integration</h3>
        <p class="mb-4">Connect with CRM platforms to manage client relationships:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Supported CRM Systems:</strong>
            <ul class="list-disc ml-6 mb-2 mt-2">
              <li>Microsoft Dynamics 365</li>
              <li>Salesforce</li>
              <li>HubSpot</li>
              <li>Custom CRM via API</li>
            </ul>
          </li>
          <li><strong>Data Synchronization:</strong> Bi-directional sync of client information and project details</li>
          <li><strong>Opportunity Management:</strong> Create and update sales opportunities directly from projects</li>
          <li><strong>Contact Association:</strong> Link projects to specific contacts and accounts</li>
          <li><strong>Activity Tracking:</strong> Log site walks and client interactions in the CRM</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Google Maps Integration</h3>
        <p class="mb-4">Leverage location-based features for project management:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Address Geocoding:</strong> Automatically convert addresses to precise coordinates</li>
          <li><strong>Satellite Imagery:</strong> View high-resolution satellite images of project locations</li>
          <li><strong>Directions:</strong> Get driving directions to site locations</li>
          <li><strong>Location Pinning:</strong> Mark precise coordinates for equipment installations</li>
          <li><strong>Area Calculations:</strong> Measure distances and areas for coverage planning</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Weather API Integration</h3>
        <p class="mb-4">Access weather data for site planning:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Current Conditions:</strong> Check weather at project locations</li>
          <li><strong>Forecast:</strong> View weather forecasts for planned site walks</li>
          <li><strong>Weather Alerts:</strong> Receive notifications about severe weather that might affect scheduling</li>
          <li><strong>Historical Data:</strong> Access past weather conditions for documentation purposes</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Mobile Device Integration</h3>
        <p class="mb-4">Use mobile capabilities for on-site data collection:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Camera Access:</strong> Take photos directly within the application</li>
          <li><strong>GPS Location:</strong> Automatically tag equipment with precise GPS coordinates</li>
          <li><strong>Offline Mode:</strong> Continue working without internet connectivity</li>
          <li><strong>Barcode/QR Scanning:</strong> Quickly identify equipment with scanning capability</li>
          <li><strong>Voice Input:</strong> Use speech-to-text for faster data entry in the field</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">API Access</h3>
        <p class="mb-4">Integrate with other systems using the application's API:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>RESTful API:</strong> Standard HTTP endpoints for data access and manipulation</li>
          <li><strong>Authentication:</strong> Secure API access with OAuth 2.0</li>
          <li><strong>Webhooks:</strong> Receive notifications when project data changes</li>
          <li><strong>Batch Operations:</strong> Efficiently process multiple records</li>
          <li><strong>Custom Integration:</strong> Connect with proprietary or legacy systems</li>
        </ul>
      `
    },
    {
      id: 7,
      title: 'User Management & Settings',
      description: 'Configure user accounts, permissions, and application preferences.',
      category: 'administration',
      content: `
        <h2 class="text-2xl font-bold mb-4">User Management & Settings</h2>
        <p class="mb-4">Checklist Wizard provides comprehensive tools for managing user accounts, permissions, and application preferences.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">User Accounts</h3>
        <p class="mb-4">Manage application users and their access rights:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>User Types:</strong>
            <ul class="list-disc ml-6 mb-2 mt-2">
              <li>Administrators: Full access to all features and settings</li>
              <li>Sales Engineers: Create and manage projects and equipment</li>
              <li>BDMs: View projects and reports</li>
              <li>Technicians: Access assigned projects with limited editing</li>
              <li>Clients: View-only access to specific projects</li>
            </ul>
          </li>
          <li><strong>User Profile Management:</strong> Update personal information, contact details, and preferences</li>
          <li><strong>Password Management:</strong> Change passwords and enable two-factor authentication</li>
          <li><strong>Login Options:</strong> Use email/password or sign in with Microsoft</li>
          <li><strong>Session Management:</strong> View and manage active sessions</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Permission Settings</h3>
        <p class="mb-4">Configure granular access controls:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Project-Level Permissions:</strong> Control who can view, edit, or administer specific projects</li>
          <li><strong>Feature-Based Restrictions:</strong> Enable or disable access to specific application features</li>
          <li><strong>Export Controls:</strong> Manage who can generate and download reports</li>
          <li><strong>Admin Functions:</strong> Delegate administrative capabilities to trusted users</li>
          <li><strong>Permission Groups:</strong> Create reusable permission sets for different user roles</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Application Preferences</h3>
        <p class="mb-4">Customize the application behavior and appearance:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Theme Settings:</strong> Choose between light and dark modes or customize colors</li>
          <li><strong>Display Options:</strong> Configure table layouts, card views, and default sorting</li>
          <li><strong>Notification Preferences:</strong> Set up email, in-app, or mobile notifications</li>
          <li><strong>Default Values:</strong> Configure standard settings for new projects and equipment</li>
          <li><strong>Language Settings:</strong> Select preferred language for the user interface</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Integration Configuration</h3>
        <p class="mb-4">Set up connections to external services:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>API Keys Management:</strong> Securely store and manage keys for external services</li>
          <li><strong>CRM Connection:</strong> Configure synchronization with CRM systems</li>
          <li><strong>Microsoft 365 Setup:</strong> Link your Microsoft account for enhanced features</li>
          <li><strong>Google Maps Configuration:</strong> Set up mapping and geocoding services</li>
          <li><strong>Azure OpenAI Settings:</strong> Configure AI behavior and usage limits</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Data Management</h3>
        <p class="mb-4">Control how application data is stored and processed:</p>
        <ul class="list-disc ml-6 mb-4">
          <li><strong>Storage Options:</strong> Configure where project files and images are stored</li>
          <li><strong>Backup Settings:</strong> Schedule automatic backups of important project data</li>
          <li><strong>Retention Policies:</strong> Define how long different types of data should be kept</li>
          <li><strong>Data Export:</strong> Extract complete datasets for archiving or migration</li>
          <li><strong>Privacy Controls:</strong> Manage data sharing and privacy settings</li>
        </ul>
      `
    }
  ];

  const faqs = [
    {
      question: 'How do I create a new project?',
      answer: 'Click on the "New Site Walk" button in the top navigation bar. Fill out the project details form including client name, site address, project name, and SE/BDM information. Click "Create Project" to save your new site walk project.'
    },
    {
      question: 'Can I export data to Excel?',
      answer: 'Yes, the application supports comprehensive export functionality including Excel, PDF, CSV, and JSON formats. For door schedules, navigate to the Door Schedules section under Reports and select your preferred template. For camera schedules, use the Camera Schedules section. You can also export full project summaries with equipment inventories, site photographs, and annotated floorplans.'
    },
    {
      question: 'How do I add equipment to my project?',
      answer: 'Navigate to your project, select the appropriate equipment tab (Card Access, Cameras, Elevators & Turnstiles, Intercoms, or Kastle Video Guarding), and click the "Add New" button. Fill out the equipment details in the form and click "Save". For access points, the process is two-step: first enter the details, then upload images.'
    },
    {
      question: 'How do I configure access points with specific hardware?',
      answer: 'When adding or editing an access point, you can specify detailed hardware configurations including reader type (e.g., multi-technology, proximity, biometric), lock type (electric strike, magnetic lock, etc.), monitoring type (door contact, REX), and additional options for lock providers, takeover status, and interior/perimeter designation. You can also use Quick Configuration templates for common setups.'
    },
    {
      question: 'Can I upload floorplans?',
      answer: 'Yes, you can upload floorplans in PDF format, including multi-page PDFs for buildings with multiple floors. Go to the Floorplans section of your project, click "Upload Floorplan", select your PDF file, add a name and description, and click "Upload". The system supports high-fidelity rendering of PDF documents with precise zooming and panning capabilities.'
    },
    {
      question: 'How do I mark equipment on floorplans?',
      answer: 'Open the floorplan viewer for your project and navigate to the appropriate page/floor. Click "Add Marker" or use the right-click menu, then select the position on the floorplan. Choose the equipment type and select the specific item from your project inventory. You can adjust the marker position by dragging it if needed. The system will maintain perfect synchronization between equipment lists and floorplan markers.'
    },
    {
      question: 'What AI capabilities does the application offer?',
      answer: 'Checklist Wizard integrates with Microsoft\'s Azure OpenAI in Kastle\'s secure environment to provide intelligent features including: a conversational chatbot for equipment configuration with voice interaction, image analysis for equipment identification, AI-generated documentation (SOW, technical guides, executive summaries), multi-language translation of technical documents, and security system analysis with coverage evaluation and equipment recommendations. All AI processing happens within Kastle\'s secure Azure environment, ensuring the highest levels of data security and compliance.'
    },
    {
      question: 'How does the camera gateway calculator work?',
      answer: 'The gateway calculator automatically determines the optimal number and configuration of gateway devices based on your camera inventory. Navigate to the Kastle Video Guarding section and select "Gateway Calculator". The system analyzes your camera count, resolution settings, and bandwidth requirements to recommend the appropriate gateway configuration. You can then create gateway devices and assign cameras to specific gateways for optimal performance.'
    },
    {
      question: 'Can I collaborate with team members on projects?',
      answer: 'Yes, Checklist Wizard supports collaboration through user management and permissions. Administrators can add users with different roles (Administrators, Sales Engineers, BDMs, Technicians, Clients) and set specific permissions for project access and feature usage. Team members can work on the same project simultaneously, and the system tracks changes and updates in the activity log.'
    },
    {
      question: 'How does the bidirectional synchronization between equipment lists and floorplans work?',
      answer: 'The system maintains perfect synchronization between equipment inventories and floorplan markers. Adding a marker to a floorplan automatically updates the equipment\'s location data. Deleting equipment from a list removes its markers from all floorplans. Moving a marker updates the equipment\'s location details. The system runs consistency checks to ensure marker counts match equipment inventory.'
    },
    {
      question: 'Can I integrate with my CRM system?',
      answer: 'Yes, Checklist Wizard integrates with popular CRM systems including Microsoft Dynamics 365, Salesforce, and HubSpot. Navigate to Settings and select the CRM Integration tab to configure your connection. Once set up, the application can sync client information, project details, and equipment lists with your CRM. You can also create new opportunities in your CRM directly from Checklist Wizard.'
    },
    {
      question: 'How do I use the AI chatbot assistant?',
      answer: 'The AI chatbot assistant is accessible from any screen via the chat icon in the bottom right corner. You can type questions or commands in natural language or use the microphone button for voice input. The chatbot can help you add and configure equipment, answer questions about your project, generate reports, and provide contextual guidance for the current task.'
    },
    {
      question: 'How do I generate door schedules?',
      answer: 'Navigate to the Door Schedules section under Reports in the sidebar. Select the project(s) to include in the schedule and choose your preferred template format (Standard, Detailed, or Custom). Configure additional options like including images, floor designations, hardware specifications, and notes. Click "Generate Door Schedule" to create and download the document in your chosen format.'
    },
    {
      question: 'What image formats are supported for equipment photos?',
      answer: 'Checklist Wizard supports standard image formats including JPEG, PNG, GIF, and WebP. The system automatically optimizes uploaded images, compressing them for efficient storage while maintaining visual quality. You can upload multiple images for each piece of equipment to document different angles, mounting details, and surrounding conditions.'
    },
    {
      question: 'How can I duplicate existing equipment items?',
      answer: 'To duplicate equipment items, navigate to the appropriate equipment tab and select the checkbox next to the items you want to duplicate. Click the "Duplicate" button in the action bar. You can select multiple items for batch duplication. The system creates copies with the same configuration but allows you to modify the location and other specific details for each duplicate.'
    }
  ];

  const filteredGuides = searchQuery
    ? guides.filter(guide => 
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : guides;

  const filteredFaqs = searchQuery
    ? faqs.filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqs;

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Documentation</h1>
        
        <div className="mb-6">
          <Input
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Tabs defaultValue="guides" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="guides">Guides</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
          </TabsList>

          <TabsContent value="guides">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGuides.map((guide) => (
                <Card key={guide.id} className="h-full">
                  <CardHeader>
                    <CardTitle>{guide.title}</CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {guide.category}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        // Open the guide content in a modal or expand it
                        document.getElementById(`guide-content-${guide.id}`)?.classList.toggle('hidden');
                      }}
                    >
                      Read Guide
                    </Button>
                    <div id={`guide-content-${guide.id}`} className="mt-4 hidden prose prose-sm">
                      <div dangerouslySetInnerHTML={{ __html: guide.content }} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="faqs">
            <div className="max-w-3xl mx-auto">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="mb-4">
                  <div 
                    className="font-medium text-lg mb-2 cursor-pointer flex items-center"
                    onClick={() => {
                      document.getElementById(`faq-answer-${index}`)?.classList.toggle('hidden');
                    }}
                  >
                    <span className="material-icons mr-2">
                      help_outline
                    </span>
                    {faq.question}
                  </div>
                  <div id={`faq-answer-${index}`} className="pl-8 text-gray-600 hidden">
                    {faq.answer}
                  </div>
                  {index < filteredFaqs.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default DocumentationPage;
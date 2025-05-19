import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface DocumentationWikiProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocumentationWiki({ isOpen, onClose }: DocumentationWikiProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center" style={{ color: 'var(--red-accent)' }}>
            Site Walk Documentation
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full mt-4" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="floorplans">Floorplans</TabsTrigger>
            <TabsTrigger value="exports">Exports</TabsTrigger>
            <TabsTrigger value="ai">AI Features</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh]">
            <TabsContent value="overview" className="p-4 space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Site Walk Application Overview</h2>
              <p className="text-gray-700">
                The Site Walk application is a comprehensive tool designed to streamline the process of documenting, managing, and reporting on security equipment during site assessments. This application replaces traditional paper-based tracking with a digital solution that enhances productivity and accuracy.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-6">Key Features</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Multi-Project Management</strong> - Manage multiple site walks simultaneously with separate projects.</li>
                <li><strong>Equipment Tracking</strong> - Document access points, cameras, elevators, and intercoms with detailed specifications.</li>
                <li><strong>Interactive Floorplans</strong> - Upload and annotate PDF floorplans with equipment markers.</li>
                <li><strong>Export Options</strong> - Export data in multiple formats including PDF, Excel, CSV, and JSON.</li>
                <li><strong>AI-Powered Analysis</strong> - Generate reports, summaries, and insights using Azure OpenAI in Kastle's secure environment.</li>
                <li><strong>Multi-Format Exports</strong> - Create customized exports based on specific templates.</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-6">Getting Started</h3>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>Create a new project by clicking the "New Site Walk" button in the top navigation.</li>
                <li>Enter the project details including name, client, and location.</li>
                <li>Navigate to the different equipment tabs to add items.</li>
                <li>Upload floorplans and mark equipment locations.</li>
                <li>Generate reports and export data as needed.</li>
              </ol>
            </TabsContent>

            <TabsContent value="equipment" className="p-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="access-points">
                  <AccordionTrigger className="text-lg font-semibold">Access Points</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-gray-700">
                      Access points represent doors and entry/exit points in the security system. Each access point can be configured with various hardware options and settings.
                    </p>
                    <h4 className="font-semibold text-gray-800">Key Fields:</h4>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li><strong>Location</strong> - Physical location description of the access point</li>
                      <li><strong>Reader Type</strong> - Type of card reader or access control device</li>
                      <li><strong>Lock Type</strong> - Mechanism used to secure the door</li>
                      <li><strong>Monitoring Type</strong> - How the door status is monitored</li>
                      <li><strong>Lock Provider</strong> - Manufacturer of the locking hardware</li>
                      <li><strong>Takeover</strong> - Whether existing hardware is being reused</li>
                      <li><strong>Interior/Perimeter</strong> - Location relative to building perimeter</li>
                    </ul>
                    <h4 className="font-semibold text-gray-800 mt-4">Advanced Options:</h4>
                    <p className="text-gray-700">
                      Access points have additional configuration options under "Advanced Fields" including panel information, noisy prop settings, crashbars, and specialized lock types.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="cameras">
                  <AccordionTrigger className="text-lg font-semibold">Cameras</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-gray-700">
                      Cameras document video surveillance equipment. The application allows tracking of camera locations, models, and technical specifications.
                    </p>
                    <h4 className="font-semibold text-gray-800">Key Fields:</h4>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li><strong>Location</strong> - Where the camera is mounted</li>
                      <li><strong>Camera Type</strong> - Form factor and design type</li>
                      <li><strong>Housing</strong> - Environmental protection for the camera</li>
                      <li><strong>Resolution</strong> - Image quality in megapixels</li>
                      <li><strong>Lens Type</strong> - Fixed or varifocal optics</li>
                      <li><strong>IR Capability</strong> - Infrared night vision settings</li>
                      <li><strong>Mounting Height</strong> - Distance from floor/ground</li>
                    </ul>
                    <h4 className="font-semibold text-gray-800 mt-4">Camera Views:</h4>
                    <p className="text-gray-700">
                      For each camera, you can specify field of view information and coverage details to ensure proper placement and configuration for security requirements.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="elevators">
                  <AccordionTrigger className="text-lg font-semibold">Elevators</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-gray-700">
                      Elevators section allows documentation of elevator security integration, including floor access restrictions and hardware requirements.
                    </p>
                    <h4 className="font-semibold text-gray-800">Key Fields:</h4>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li><strong>Elevator Name/ID</strong> - Identifier for the elevator</li>
                      <li><strong>Manufacturer</strong> - Elevator manufacturer</li>
                      <li><strong>Controller Type</strong> - Elevator control system</li>
                      <li><strong>Floor Count</strong> - Number of floors served</li>
                      <li><strong>Restricted Floors</strong> - Floors requiring access control</li>
                      <li><strong>Interface Type</strong> - How security system connects</li>
                    </ul>
                    <h4 className="font-semibold text-gray-800 mt-4">Integration Requirements:</h4>
                    <p className="text-gray-700">
                      Specify elevator control room location, wiring requirements, and any specialized hardware needed for proper integration with the access control system.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="intercoms">
                  <AccordionTrigger className="text-lg font-semibold">Intercoms</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-gray-700">
                      The intercoms section tracks intercom placement, functionality, and integration with the overall security system.
                    </p>
                    <h4 className="font-semibold text-gray-800">Key Fields:</h4>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li><strong>Location</strong> - Where the intercom is installed</li>
                      <li><strong>Intercom Type</strong> - Audio only or audio/video</li>
                      <li><strong>Mounting Style</strong> - Surface, flush, or pedestal mount</li>
                      <li><strong>Connected Door</strong> - Associated access point</li>
                      <li><strong>Network Connection</strong> - How device connects</li>
                      <li><strong>Power Source</strong> - Power requirements</li>
                    </ul>
                    <h4 className="font-semibold text-gray-800 mt-4">Additional Features:</h4>
                    <p className="text-gray-700">
                      Document special features like directory integration, emergency call buttons, and desk/guard station connectivity options for each intercom.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="floorplans" className="p-4 space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Interactive Floorplans</h2>
              <p className="text-gray-700">
                The floorplan feature allows you to upload PDF floorplans and mark equipment locations visually. This provides a spatial context for your site walk data and helps with planning and documentation.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-6">Working with Floorplans</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Upload</strong> - Add PDF floorplans to your project.</li>
                <li><strong>Navigate</strong> - Switch between multiple floorplans and pages.</li>
                <li><strong>Mark Equipment</strong> - Add markers for access points, cameras, elevators, and intercoms.</li>
                <li><strong>Edit Markers</strong> - Adjust position and properties of existing markers.</li>
                <li><strong>Delete Markers</strong> - Remove incorrectly placed markers.</li>
                <li><strong>Zoom and Pan</strong> - Navigate large floorplans with zoom and pan controls.</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-6">Marker Types</h3>
              <p className="text-gray-700">
                Each equipment type has a distinct marker style for easy identification:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Access Points</strong> - Red door symbols</li>
                <li><strong>Cameras</strong> - Blue camera icons with view angle indication</li>
                <li><strong>Elevators</strong> - Green elevator symbols</li>
                <li><strong>Intercoms</strong> - Purple intercom icons</li>
                <li><strong>Notes</strong> - Yellow annotation markers for general notes</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-6">Adding Markers</h3>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>Select the equipment type from the toolbar.</li>
                <li>Click on the floorplan where you want to place the marker.</li>
                <li>In the popup, select the specific equipment item to associate with the marker.</li>
                <li>Add any additional notes or details for the marker.</li>
                <li>Save to create the marker on the floorplan.</li>
              </ol>
            </TabsContent>

            <TabsContent value="exports" className="p-4 space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Export Functionality</h2>
              <p className="text-gray-700">
                The Site Walk application provides comprehensive export options to generate reports, documentation, and data files in various formats.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-6">Export Formats</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>PDF</strong> - Generate professional PDF reports with complete project details, equipment lists, and floorplan images with marked equipment locations.
                </li>
                <li>
                  <strong>Excel</strong> - Export data to Excel spreadsheets for further analysis, budgeting, or integration with other systems. Includes customized formatting and multiple sheets for different equipment types.
                </li>
                <li>
                  <strong>CSV</strong> - Create comma-separated value files for easy import into various database and analysis tools.
                </li>
                <li>
                  <strong>JSON</strong> - Export structured data in JSON format for integration with other applications or web services.
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-6">Special Export Types</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Door Schedules</strong> - Generate specialized door schedule exports using templates that align with industry standards or custom formats for specific integrators and manufacturers.
                </li>
                <li>
                  <strong>Equipment Lists</strong> - Create detailed equipment lists with specifications and quantities for procurement purposes.
                </li>
                <li>
                  <strong>Project Summary</strong> - Export executive summaries that provide an overview of the project scope, equipment counts, and key requirements.
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-6">Creating Exports</h3>
              <ol className="list-decimal pl-6 space-y-2 text-gray-700">
                <li>Navigate to the project dashboard or specific equipment section.</li>
                <li>Click the "Export" button in the section header.</li>
                <li>Select the desired export format from the dropdown menu.</li>
                <li>Configure any specific export options or templates.</li>
                <li>Click "Generate Export" to create and download the file.</li>
              </ol>

              <p className="text-gray-700 mt-4">
                <strong>Note:</strong> For door schedule template exports, the system uses a specific Excel template file that maintains formatting while populating data fields.
              </p>
            </TabsContent>

            <TabsContent value="ai" className="p-4 space-y-4">
              <h2 className="text-xl font-bold text-gray-800">AI-Powered Features</h2>
              <p className="text-gray-700">
                The Site Walk application integrates Microsoft's Azure OpenAI in Kastle's secure environment to provide advanced analysis, reporting, and assistance capabilities that enhance productivity and insight while maintaining the highest security standards.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mt-6">AI Capabilities</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Project Overviews</strong> - Generate concise summaries of project scope, equipment counts, and key security considerations based on collected data.
                </li>
                <li>
                  <strong>Technical Guides</strong> - Create detailed technical documentation with installation guidelines, wiring requirements, and system architecture recommendations.
                </li>
                <li>
                  <strong>Floorplan Analysis</strong> - Automatically analyze floorplan markups to identify potential coverage gaps, optimal equipment placement, and security vulnerabilities.
                </li>
                <li>
                  <strong>Meeting Agendas</strong> - Generate comprehensive agendas for quote review meetings that highlight key discussion points, technical requirements, and budget considerations.
                </li>
                <li>
                  <strong>Turnover Summaries</strong> - Produce detailed turnover call meeting summaries with action items, responsibilities, and project milestone information.
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-6">AI Image Features</h3>
              <p className="text-gray-700">
                The Azure OpenAI integration provides advanced image processing capabilities in a secure environment:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Floorplan Recognition</strong> - Analyze uploaded floorplans to identify key areas and potential equipment locations.</li>
                <li><strong>Coverage Visualization</strong> - Generate visual representations of camera coverage areas and access control zones.</li>
                <li><strong>Equipment Identification</strong> - Recognize and catalog existing equipment from site photos.</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mt-6">Multi-Language Support</h3>
              <p className="text-gray-700">
                The AI system can translate Scope of Work documents and technical specifications into multiple languages to support international projects and diverse teams.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-6">
                <h4 className="font-semibold text-amber-800">Note About AI Features</h4>
                <p className="text-amber-700">
                  AI features require valid Azure OpenAI credentials to function. If you're experiencing issues with AI functionality, please ensure your Azure OpenAI API key and deployment name are correctly configured in the system settings.
                </p>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
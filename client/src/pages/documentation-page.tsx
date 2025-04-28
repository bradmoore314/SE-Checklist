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
        <h2 class="text-2xl font-bold mb-4">Getting Started with Site Walk Checklist</h2>
        <p class="mb-4">Welcome to the Site Walk Checklist application! This guide will help you get started with creating and managing your site walk projects.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Creating a New Project</h3>
        <p class="mb-4">To create a new project, click the "New Site Walk" button in the top navigation bar. Fill out the project details including client name, site address, and any other required information.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Adding Equipment</h3>
        <p class="mb-4">Once your project is created, you can add different types of equipment such as access points, cameras, elevators, and intercoms. Use the tabs on the project page to navigate between different equipment types.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Uploading Floorplans</h3>
        <p class="mb-4">You can upload floorplans in PDF format. Once uploaded, you can mark equipment locations directly on the floorplan for easier visualization.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Exporting Data</h3>
        <p class="mb-4">The application supports exporting data in multiple formats including PDF, Excel, CSV, and JSON. Use the export options to generate reports and door schedules.</p>
      `
    },
    {
      id: 2,
      title: 'Floorplan Management',
      description: 'How to upload and annotate floorplans.',
      category: 'advanced',
      content: `
        <h2 class="text-2xl font-bold mb-4">Floorplan Management</h2>
        <p class="mb-4">The Site Walk Checklist application allows you to upload and annotate floorplans for better visualization of equipment placement.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Uploading Floorplans</h3>
        <p class="mb-4">To upload a floorplan, navigate to the Floorplans tab in your project and click the "Upload Floorplan" button. The application supports PDF files with multiple pages.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Adding Markers</h3>
        <p class="mb-4">Once a floorplan is uploaded, you can add markers for different equipment types. Click on the floorplan where you want to place the equipment and select the equipment type and specific item from the dropdown menu.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Editing Markers</h3>
        <p class="mb-4">To edit a marker, click on it in the floorplan. You can change its label, equipment association, or delete it if needed.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Viewing Equipment on Floorplans</h3>
        <p class="mb-4">When viewing equipment lists, you can click the "Show on Floorplan" button to see where the equipment is located on the floorplan.</p>
      `
    },
    {
      id: 3,
      title: 'Export Functionality',
      description: 'How to export project data in different formats.',
      category: 'advanced',
      content: `
        <h2 class="text-2xl font-bold mb-4">Export Functionality</h2>
        <p class="mb-4">The Site Walk Checklist application provides robust export functionality to help you create reports and documentation.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Available Export Formats</h3>
        <p class="mb-4">The application supports exporting data in the following formats:</p>
        <ul class="list-disc ml-6 mb-4">
          <li>PDF - For formal reports and documentation</li>
          <li>Excel - For data analysis and manipulation</li>
          <li>CSV - For importing into other systems</li>
          <li>JSON - For developers and API integration</li>
        </ul>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Exporting Door Schedules</h3>
        <p class="mb-4">The application can export door schedules to a specific Excel template. Use the "Export Door Schedule" option to generate a formatted door schedule based on the access points in your project.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Exporting Project Reports</h3>
        <p class="mb-4">You can export project summary reports, technical guides, and other types of reports using the report generation feature. These reports can be customized to include specific information about your project.</p>
      `
    },
    {
      id: 4,
      title: 'AI Features',
      description: 'How to use AI-powered features in the application.',
      category: 'advanced',
      content: `
        <h2 class="text-2xl font-bold mb-4">AI Features</h2>
        <p class="mb-4">The Site Walk Checklist application leverages AI to provide intelligent insights and automate certain tasks.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Gemini AI Integration</h3>
        <p class="mb-4">The application integrates with Gemini AI to provide enhanced capabilities such as image analysis, text summarization, and recommendation generation.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">AI-Generated Reports</h3>
        <p class="mb-4">You can use the AI to generate different types of reports including project overviews, technical guides, and meeting agendas. The AI analyzes your project data to create comprehensive reports tailored to your needs.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Image Analysis</h3>
        <p class="mb-4">Upload images of equipment or site conditions, and the AI can help identify equipment types, suggest configurations, and highlight potential issues.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Multi-Language Support</h3>
        <p class="mb-4">The AI can translate your Scope of Work and other documents into multiple languages to facilitate international projects and communication with non-English speaking stakeholders.</p>
      `
    },
    {
      id: 5,
      title: 'CRM Integration',
      description: 'How to connect and sync with your CRM system.',
      category: 'integrations',
      content: `
        <h2 class="text-2xl font-bold mb-4">CRM Integration</h2>
        <p class="mb-4">The Site Walk Checklist application can integrate with your CRM system to sync project data and streamline workflows.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Supported CRM Systems</h3>
        <p class="mb-4">The application currently supports integration with Microsoft Dynamics 365 and Salesforce. Additional CRM integrations may be available in future updates.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Setting Up CRM Integration</h3>
        <p class="mb-4">To set up CRM integration, navigate to the Settings page and select the CRM Integration tab. Enter your CRM credentials and API information, then test the connection.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Syncing Project Data</h3>
        <p class="mb-4">Once integrated, the application can sync project data with your CRM, including client information, project details, and equipment lists. This ensures your CRM has the most up-to-date information about your security projects.</p>
        
        <h3 class="text-xl font-bold mt-6 mb-2">Creating CRM Opportunities</h3>
        <p class="mb-4">You can create new opportunities in your CRM directly from the Site Walk Checklist application. This streamlines the process of converting site walks into sales opportunities.</p>
      `
    }
  ];

  const faqs = [
    {
      question: 'How do I create a new project?',
      answer: 'Click on the "New Site Walk" button in the top navigation bar and fill out the project details form.'
    },
    {
      question: 'Can I export data to Excel?',
      answer: 'Yes, the application supports exporting data to Excel, PDF, CSV, and JSON formats. Use the export options in the project view.'
    },
    {
      question: 'How do I add equipment to my project?',
      answer: 'Navigate to your project, select the appropriate tab (Access Points, Cameras, etc.), and click the "Add New" button.'
    },
    {
      question: 'Can I upload floor plans?',
      answer: 'Yes, you can upload floor plans in PDF format. Go to the Floorplans tab in your project and use the upload button.'
    },
    {
      question: 'How do I mark equipment on floor plans?',
      answer: 'After uploading a floor plan, open it and click on the location where you want to add equipment. Select the equipment type and specific item from the dropdown menu.'
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
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface FormData {
  // Discovery tab fields
  siteEnvironment: string;
  
  // Customer Vertical now moved to Use Case tab  
  customerVertical: string;
  
  // KVG-specific fields
  kvgCameraStreamsCount: number;

  // Technology fields
  rspndrGdods: string;
}

const SimpleKVGPage: React.FC = () => {
  // Form data state
  const [formData, setFormData] = useState<FormData>({
    siteEnvironment: "",
    customerVertical: "",
    kvgCameraStreamsCount: 0,
    rspndrGdods: "",
  });

  // Handle form data change
  const handleFormChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Kastle Video Guarding Configuration</h1>
      
      <Tabs defaultValue="discovery">
        <TabsList>
          <TabsTrigger value="discovery">Discovery</TabsTrigger>
          <TabsTrigger value="use-case">Use Case</TabsTrigger>
        </TabsList>
        
        <TabsContent value="discovery">
          <Card>
            <CardHeader>
              <CardTitle>KVG Customer Discovery</CardTitle>
              <CardDescription>Gather initial customer details</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Site Environment field in Discovery tab */}
              <div className="mb-4">
                <Label htmlFor="siteEnvironment">Site Environment:</Label>
                <Select 
                  value={formData.siteEnvironment} 
                  onValueChange={(value) => handleFormChange("siteEnvironment", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indoor">Indoor</SelectItem>
                    <SelectItem value="Outdoor">Outdoor</SelectItem>
                    <SelectItem value="Mixed">Both Indoor & Outdoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* KVG Camera Streams Count field */}
              <div className="mb-4">
                <Label htmlFor="kvgCameraStreamsCount">
                  # of KVG Cameras Video Streams
                </Label>
                <Input 
                  id="kvgCameraStreamsCount"
                  type="number"
                  min="0"
                  value={formData.kvgCameraStreamsCount}
                  onChange={(e) => handleFormChange("kvgCameraStreamsCount", parseInt(e.target.value) || 0)}
                />
              </div>

              {/* RSPNDR-GDODS dropdown */}
              <div className="mb-4">
                <Label htmlFor="rspndrGdods">RSPNDR-GDODS:</Label>
                <Select 
                  value={formData.rspndrGdods} 
                  onValueChange={(value) => handleFormChange("rspndrGdods", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Select">Select</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="GDODS - Dispatch on Demand Subscriptions">GDODS - Dispatch on Demand Subscriptions</SelectItem>
                    <SelectItem value="SGPP - Scheduled Periodic Site Checks">SGPP - Scheduled Periodic Site Checks</SelectItem>
                    <SelectItem value="Both GDODS and SGPP">Both GDODS and SGPP</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="use-case">
          <Card>
            <CardHeader>
              <CardTitle>Use Case - SOW - SME</CardTitle>
              <CardDescription>Define use cases and scope of work</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Customer Vertical field now in Use Case tab */}
              <div className="mb-4">
                <Label htmlFor="customerVertical">Customer Vertical:</Label>
                <Select 
                  value={formData.customerVertical} 
                  onValueChange={(value) => handleFormChange("customerVertical", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer vertical" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Commercial - Retail">Commercial - Retail</SelectItem>
                    <SelectItem value="Commercial - Office">Commercial - Office</SelectItem>
                    <SelectItem value="Commercial - Industrial">Commercial - Industrial</SelectItem>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="Multi-Family">Multi-Family</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Government">Government</SelectItem>
                    <SelectItem value="Construction">Construction</SelectItem>
                    <SelectItem value="Self Storage">Self Storage</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimpleKVGPage;
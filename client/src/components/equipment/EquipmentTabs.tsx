import { useState } from "react";
import { Project } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CardAccessTab from "./CardAccessTab";
import CamerasTab from "./CamerasTab";
import ElevatorsTab from "./ElevatorsTab";
import IntercomsTab from "./IntercomsTab";

interface EquipmentTabsProps {
  project: Project;
}

export default function EquipmentTabs({ project }: EquipmentTabsProps) {
  const [activeTab, setActiveTab] = useState("card-access");

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b">
          <TabsList className="bg-transparent border-b-0">
            <TabsTrigger 
              value="card-access" 
              className={`py-3 px-6 font-medium rounded-none text-gray-600 border-b-2 border-transparent data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-red-600`}
            >
              Card Access
            </TabsTrigger>
            <TabsTrigger 
              value="cameras" 
              className={`py-3 px-6 font-medium rounded-none text-gray-600 border-b-2 border-transparent data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-red-600`}
            >
              Cameras
            </TabsTrigger>
            <TabsTrigger 
              value="elevators" 
              className={`py-3 px-6 font-medium rounded-none text-gray-600 border-b-2 border-transparent data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-red-600`}
            >
              Elevators & Turnstiles
            </TabsTrigger>
            <TabsTrigger 
              value="intercoms" 
              className={`py-3 px-6 font-medium rounded-none text-gray-600 border-b-2 border-transparent data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-red-600`}
            >
              Intercoms
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="card-access" className="mt-0">
          <CardAccessTab project={project} />
        </TabsContent>
        
        <TabsContent value="cameras" className="mt-0">
          <CamerasTab project={project} />
        </TabsContent>
        
        <TabsContent value="elevators" className="mt-0">
          <ElevatorsTab project={project} />
        </TabsContent>
        
        <TabsContent value="intercoms" className="mt-0">
          <IntercomsTab project={project} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

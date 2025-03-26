import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import DoorSchedules from "@/pages/door-schedules";
import CameraSchedules from "@/pages/camera-schedules";
import CardAccess from "@/pages/card-access";
import Cameras from "@/pages/cameras";
import Elevators from "@/pages/elevators";
import Intercoms from "@/pages/intercoms";
import ProjectSummary from "@/pages/project-summary";
import Settings from "@/pages/settings";
import MainLayout from "@/layouts/MainLayout";
import { SiteWalkProvider } from "@/context/SiteWalkContext";
import { ProjectProvider } from "@/context/ProjectContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      
      {/* Equipment routes */}
      <Route path="/card-access" component={CardAccess} />
      <Route path="/cameras" component={Cameras} />
      <Route path="/elevators" component={Elevators} />
      <Route path="/intercoms" component={Intercoms} />
      
      {/* Report routes */}
      <Route path="/door-schedules" component={DoorSchedules} />
      <Route path="/camera-schedules" component={CameraSchedules} />
      <Route path="/project-summary" component={ProjectSummary} />
      
      {/* Settings */}
      <Route path="/settings" component={Settings} />
      
      {/* 404 fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProjectProvider>
        <SiteWalkProvider>
          <MainLayout>
            <Router />
          </MainLayout>
        </SiteWalkProvider>
      </ProjectProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

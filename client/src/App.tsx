import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";
import DoorSchedules from "@/pages/door-schedules";
import CameraSchedules from "@/pages/camera-schedules";
import MainLayout from "@/layouts/MainLayout";
import { SiteWalkProvider } from "@/context/SiteWalkContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/projects" component={Projects} />
      <Route path="/door-schedules" component={DoorSchedules} />
      <Route path="/camera-schedules" component={CameraSchedules} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SiteWalkProvider>
        <MainLayout>
          <Router />
        </MainLayout>
      </SiteWalkProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

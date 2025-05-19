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
import Summary from "@/pages/project-summary";
import Settings from "@/pages/settings";
import AuthPage from "@/pages/auth-page";


import EnhancedFloorplansPage from "@/pages/enhanced-floorplans-page";
import ProfessionalPdfEditorPage from "@/pages/professional-pdf-editor-page";
import KastleVideoGuardingPage from "@/pages/kastle-video-guarding-page";
import CameraStreamGateway from "@/pages/camera-stream-gateway";
import QuoteReviewPage from "@/pages/quote-review-page";
import MiscPage from "@/pages/misc-page";
import CrmSettingsPage from "@/pages/crm-settings-page";
import DocumentationPage from "@/pages/documentation-page";
import FeedbackPage from "@/pages/feedback-page";

import EquipmentConfigurationWorkspacePage from "@/pages/equipment-configuration-workspace-page";
import MainLayout from "@/layouts/MainLayout";
import { OpportunityProvider } from "@/contexts/OpportunityContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import { ChatbotProvider } from "./hooks/use-chatbot";
import { ChatbotButton } from "./components/ai/ChatbotButton";
import { ChatbotWindow } from "./components/ai/ChatbotWindow";
import { FullPageChatbot } from "./components/ai/FullPageChatbot";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected routes - Redirect root to Opportunities page */}
      <ProtectedRoute path="/" component={Projects} />
      <ProtectedRoute path="/projects" component={Projects} />
      <ProtectedRoute path="/projects/:projectId/dashboard" component={Dashboard} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      
      {/* Equipment routes */}
      <ProtectedRoute path="/card-access" component={CardAccess} />
      <ProtectedRoute path="/cameras" component={Cameras} />
      <ProtectedRoute path="/elevators" component={Elevators} />
      <ProtectedRoute path="/intercoms" component={Intercoms} />
      <ProtectedRoute path="/kastle-video-guarding" component={KastleVideoGuardingPage} />
      <ProtectedRoute path="/camera-stream-gateway" component={CameraStreamGateway} />
      
      {/* Report routes */}
      <ProtectedRoute path="/door-schedules" component={DoorSchedules} />
      <ProtectedRoute path="/camera-schedules" component={CameraSchedules} />
      <ProtectedRoute path="/project-summary" component={Summary} />
      
      {/* Floorplans */}
      <ProtectedRoute path="/projects/:projectId/floorplans" component={EnhancedFloorplansPage} />

      <ProtectedRoute path="/projects/:projectId/enhanced-floorplans" component={EnhancedFloorplansPage} />
      <ProtectedRoute path="/projects/:projectId/enhanced-floorplans/:floorplanId" component={EnhancedFloorplansPage} />
      <ProtectedRoute path="/projects/:projectId/pdf-editor" component={ProfessionalPdfEditorPage} />
      <ProtectedRoute path="/projects/:projectId/pdf-editor/:floorplanId" component={ProfessionalPdfEditorPage} />
      
      {/* Quote Review */}
      <ProtectedRoute path="/projects/:projectId/quote-review" component={QuoteReviewPage} />
      
      {/* Settings */}
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/misc" component={MiscPage} />
      
      {/* Documentation and Feedback */}
      <ProtectedRoute path="/documentation" component={DocumentationPage} />
      <ProtectedRoute path="/feedback" component={FeedbackPage} />
      <ProtectedRoute path="/equipment-configuration" component={EquipmentConfigurationWorkspacePage} />
      <ProtectedRoute path="/projects/:projectId/equipment-configuration" component={EquipmentConfigurationWorkspacePage} />
      {/* 404 fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProjectProvider>
          <OpportunityProvider>
            <ChatbotProvider>
              <MainLayout>
                <Router />
                <ChatbotButton />
                <ChatbotWindow />
                <FullPageChatbot />
              </MainLayout>
            </ChatbotProvider>
          </OpportunityProvider>
        </ProjectProvider>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

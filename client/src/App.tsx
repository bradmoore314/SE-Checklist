import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
// In development mode, enable auth bypass for easier debugging
if (import.meta.env.DEV) {
  localStorage.setItem('allow_auth_bypass', 'true');
}
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
import SiteWalkSummary from "@/pages/project-summary";
import Settings from "@/pages/settings";
import AuthPage from "@/pages/auth-page";
import DebugLoginPage from "@/pages/debug-login-page";
import DebugFloorplanTest from "@/pages/debug-floorplan-test";
import FloorplansPage from "@/pages/floorplans-page";
import ModernFloorplansPage from "@/pages/modern-floorplans-page";
import EnhancedFloorplansPage from "@/pages/enhanced-floorplans-page";
import ProfessionalPdfEditorPage from "@/pages/professional-pdf-editor-page";
import KastleVideoGuardingPage from "@/pages/kastle-video-guarding-page";
import CameraStreamGateway from "@/pages/camera-stream-gateway";
import QuoteReviewPage from "@/pages/quote-review-page";
import CrmSettingsPage from "@/pages/crm-settings-page";
import DocumentationPage from "@/pages/documentation-page";
import FeedbackPage from "@/pages/feedback-page";
import GeminiTestPage from "@/pages/gemini-test-page";
import EquipmentConfigurationWorkspacePage from "@/pages/equipment-configuration-workspace-page";
import MainLayout from "@/layouts/MainLayout";
import { SiteWalkProvider } from "@/context/SiteWalkContext";
import { ProjectProvider } from "@/context/ProjectContext";
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
      <Route path="/debug-login" component={DebugLoginPage} />
      <Route path="/debug-floorplan" component={DebugFloorplanTest} />
      
      {/* Protected routes */}
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/projects" component={Projects} />
      
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
      <ProtectedRoute path="/project-summary" component={SiteWalkSummary} />
      
      {/* Floorplans */}
      <ProtectedRoute path="/projects/:projectId/floorplans" component={FloorplansPage} />
      <ProtectedRoute path="/projects/:projectId/modern-floorplans" component={ModernFloorplansPage} />
      <ProtectedRoute path="/projects/:projectId/enhanced-floorplans" component={EnhancedFloorplansPage} />
      <ProtectedRoute path="/projects/:projectId/enhanced-floorplans/:floorplanId" component={EnhancedFloorplansPage} />
      <ProtectedRoute path="/projects/:projectId/pdf-editor" component={ProfessionalPdfEditorPage} />
      <ProtectedRoute path="/projects/:projectId/pdf-editor/:floorplanId" component={ProfessionalPdfEditorPage} />
      
      {/* Quote Review */}
      <ProtectedRoute path="/projects/:projectId/quote-review" component={QuoteReviewPage} />
      
      {/* Settings */}
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/crm-settings" component={CrmSettingsPage} />
      
      {/* Documentation and Feedback */}
      <ProtectedRoute path="/documentation" component={DocumentationPage} />
      <ProtectedRoute path="/feedback" component={FeedbackPage} />
      
      {/* AI Features */}
      <ProtectedRoute path="/gemini-test" component={GeminiTestPage} />
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
          <SiteWalkProvider>
            <ChatbotProvider>
              <MainLayout>
                <Router />
                <ChatbotButton />
                <ChatbotWindow />
                <FullPageChatbot />
              </MainLayout>
            </ChatbotProvider>
          </SiteWalkProvider>
        </ProjectProvider>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

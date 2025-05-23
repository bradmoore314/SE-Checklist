import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Projects from "@/pages/projects";

import CardAccess from "@/pages/card-access";
import Cameras from "@/pages/cameras";
import Elevators from "@/pages/elevators";
import Intercoms from "@/pages/intercoms";
import Summary from "@/pages/project-summary";
import Settings from "@/pages/settings";
import AuthPage from "@/pages/auth";

import EnhancedFloorplansPage from "@/pages/enhanced-floorplans-page";
import ProfessionalPdfEditorPage from "@/pages/professional-pdf-editor-page";
import KastleVideoGuardingPage from "@/pages/kastle-video-guarding-page";
import CameraStreamGateway from "@/pages/camera-stream-gateway";
import QuoteReviewPage from "@/pages/quote-review-page";
import MiscPage from "@/pages/misc-page";

import DocumentationPage from "@/pages/documentation-page";
import FeedbackPage from "@/pages/feedback-page";

import EquipmentConfigurationWorkspacePage from "@/pages/equipment-configuration-workspace-page";
import MainLayout from "@/layouts/MainLayout";
import { OpportunityProvider } from "@/contexts/OpportunityContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { useAuth } from "@/hooks/useAuth";
import { ChatbotProvider } from "./hooks/use-chatbot";
import { ChatbotButton } from "./components/ai/ChatbotButton";
import { ChatbotWindow } from "./components/ai/ChatbotWindow";
import { FullPageChatbot } from "./components/ai/FullPageChatbot";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Switch>
      {/* Protected routes - Redirect root to Projects page */}
      <Route path="/" component={Projects} />
      <Route path="/projects" component={Projects} />
      <Route path="/projects/:projectId/dashboard" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      
      {/* Equipment routes */}
      <Route path="/card-access" component={CardAccess} />
      <Route path="/cameras" component={Cameras} />
      <Route path="/elevators" component={Elevators} />
      <Route path="/intercoms" component={Intercoms} />
      <Route path="/kastle-video-guarding" component={KastleVideoGuardingPage} />
      <Route path="/camera-stream-gateway" component={CameraStreamGateway} />
      
      {/* Report routes */}
      <Route path="/project-summary" component={Summary} />
      
      {/* Floorplans */}
      <Route path="/projects/:projectId/floorplans" component={EnhancedFloorplansPage} />
      <Route path="/projects/:projectId/enhanced-floorplans" component={EnhancedFloorplansPage} />
      <Route path="/projects/:projectId/enhanced-floorplans/:floorplanId" component={EnhancedFloorplansPage} />
      <Route path="/projects/:projectId/pdf-editor" component={ProfessionalPdfEditorPage} />
      <Route path="/projects/:projectId/pdf-editor/:floorplanId" component={ProfessionalPdfEditorPage} />
      
      {/* Quote Review */}
      <Route path="/projects/:projectId/quote-review" component={QuoteReviewPage} />
      
      {/* Settings */}
      <Route path="/settings" component={Settings} />
      <Route path="/misc" component={MiscPage} />
      
      {/* Documentation and Feedback */}
      <Route path="/documentation" component={DocumentationPage} />
      <Route path="/feedback" component={FeedbackPage} />
      <Route path="/equipment-configuration" component={EquipmentConfigurationWorkspacePage} />
      <Route path="/projects/:projectId/equipment-configuration" component={EquipmentConfigurationWorkspacePage} />
      
      {/* 404 fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;

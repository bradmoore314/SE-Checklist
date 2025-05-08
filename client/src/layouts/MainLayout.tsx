import { ReactNode, useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { useProject } from "@/contexts/ProjectContext";
import { useOpportunity } from "@/contexts/OpportunityContext";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentProject, setCurrentProject } = useProject();
  const { currentOpportunity, setCurrentOpportunity } = useOpportunity();
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  // Keep the two contexts in sync during transition
  useEffect(() => {
    if (currentProject && !currentOpportunity) {
      setCurrentOpportunity(currentProject);
    }
    if (currentOpportunity && !currentProject) {
      setCurrentProject(currentOpportunity);
    }
  }, [currentProject, currentOpportunity, setCurrentProject, setCurrentOpportunity]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // For auth page, we don't show navigation and sidebar
  if (location === "/auth") {
    return <>{children}</>;
  }

  // For non-auth pages, show the full layout with navigation
  return (
    <div className="flex h-screen overflow-hidden app-container">
      {/* Mobile sidebar with overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={toggleSidebar}
          aria-hidden="true"
        ></div>
      )}
      
      {/* Responsive sidebar - fixed on mobile, static on desktop */}
      <div className={`
        ${sidebarCollapsed ? 'hidden' : 'fixed'} 
        z-50 h-full md:static md:block
        ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'}
      `}>
        <Sidebar collapsed={sidebarCollapsed} />
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          project={currentOpportunity} 
          onToggleSidebar={toggleSidebar} 
          user={user}
        />
        <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

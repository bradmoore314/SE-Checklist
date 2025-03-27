import { ReactNode, useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { useProject } from "@/context/ProjectContext";
import { useSiteWalk } from "@/context/SiteWalkContext";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentProject, setCurrentProject } = useProject();
  const { currentSiteWalk, setCurrentSiteWalk } = useSiteWalk();
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  // Keep the two contexts in sync during transition
  useEffect(() => {
    if (currentProject && !currentSiteWalk) {
      setCurrentSiteWalk(currentProject);
    }
    if (currentSiteWalk && !currentProject) {
      setCurrentProject(currentSiteWalk);
    }
  }, [currentProject, currentSiteWalk, setCurrentProject, setCurrentSiteWalk]);

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
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          project={currentSiteWalk} 
          onToggleSidebar={toggleSidebar} 
          user={user}
        />
        <main className="flex-1 overflow-y-auto p-6" style={{ backgroundColor: 'var(--darkest-grey)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

import { ReactNode, useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import TopNav from "@/components/TopNav";
import { useProject } from "@/context/ProjectContext";
import { useSiteWalk } from "@/context/SiteWalkContext";

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentProject, setCurrentProject } = useProject();
  const { currentSiteWalk, setCurrentSiteWalk } = useSiteWalk();

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

  // Use currentSiteWalk instead of currentProject
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={sidebarCollapsed} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav 
          project={currentSiteWalk} 
          onToggleSidebar={toggleSidebar} 
        />
        <main className="flex-1 overflow-y-auto p-6 bg-neutral-100">
          {children}
        </main>
      </div>
    </div>
  );
}

import { createContext, useContext, useState, ReactNode } from "react";
import { Project } from "@shared/schema";

interface SiteWalkContextType {
  currentSiteWalk: Project | null;
  setCurrentSiteWalk: (siteWalk: Project | null) => void;
}

const SiteWalkContext = createContext<SiteWalkContextType | undefined>(undefined);

export function SiteWalkProvider({ children }: { children: ReactNode }) {
  const [currentSiteWalk, setCurrentSiteWalk] = useState<Project | null>(null);

  return (
    <SiteWalkContext.Provider value={{ currentSiteWalk, setCurrentSiteWalk }}>
      {children}
    </SiteWalkContext.Provider>
  );
}

export function useSiteWalk() {
  const context = useContext(SiteWalkContext);
  if (context === undefined) {
    throw new Error("useSiteWalk must be used within a SiteWalkProvider");
  }
  return context;
}
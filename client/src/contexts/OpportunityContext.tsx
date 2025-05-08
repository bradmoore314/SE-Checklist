import { createContext, useContext, useState, ReactNode } from "react";
import { Project } from "@shared/schema";

interface OpportunityContextType {
  currentOpportunity: Project | null;
  setCurrentOpportunity: (opportunity: Project | null) => void;
}

const OpportunityContext = createContext<OpportunityContextType | undefined>(undefined);

export function OpportunityProvider({ children }: { children: ReactNode }) {
  const [currentOpportunity, setCurrentOpportunity] = useState<Project | null>(null);

  return (
    <OpportunityContext.Provider value={{ currentOpportunity, setCurrentOpportunity }}>
      {children}
    </OpportunityContext.Provider>
  );
}

export function useOpportunity() {
  const context = useContext(OpportunityContext);
  if (context === undefined) {
    throw new Error("useOpportunity must be used within an OpportunityProvider");
  }
  return context;
}
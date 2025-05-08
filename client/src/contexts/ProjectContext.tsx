import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Project } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ProjectContextType {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  recentProjects: Project[];
  addToRecentProjects: (project: Project) => void;
  removeFromRecentProjects: (projectId: number) => void;
  isLoadingProjects: boolean;
  allProjects: Project[];
  refreshProjects: () => void;
  pinnedProjects: Project[];
  pinProject: (project: Project) => void;
  unpinProject: (projectId: number) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Maximum number of recent projects to store
const MAX_RECENT_PROJECTS = 5;

// Key for storing pinned project IDs in localStorage
const PINNED_PROJECTS_KEY = 'pinnedProjects';
const RECENT_PROJECTS_KEY = 'recentProjects';

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [pinnedProjectIds, setPinnedProjectIds] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(PINNED_PROJECTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load pinned projects', e);
      return [];
    }
  });
  
  const { toast } = useToast();
  
  // Fetch all projects
  const { data: allProjects = [], isLoading: isLoadingProjects, refetch } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  // Compute pinned projects based on pinnedProjectIds and allProjects
  const pinnedProjects = allProjects.filter(project => 
    pinnedProjectIds.includes(project.id)
  );
  
  // Handler to add a project to recent projects
  const addToRecentProjects = (project: Project) => {
    setRecentProjects(prev => {
      // Remove the project if it already exists in the list
      const filtered = prev.filter(p => p.id !== project.id);
      // Add the project to the beginning of the list
      const newList = [project, ...filtered].slice(0, MAX_RECENT_PROJECTS);
      
      // Save to localStorage
      try {
        localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(
          newList.map(p => p.id)
        ));
      } catch (e) {
        console.error('Failed to save recent projects', e);
      }
      
      return newList;
    });
  };
  
  // Handler to remove a project from recent projects
  const removeFromRecentProjects = (projectId: number) => {
    setRecentProjects(prev => {
      const newList = prev.filter(p => p.id !== projectId);
      
      // Save to localStorage
      try {
        localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(
          newList.map(p => p.id)
        ));
      } catch (e) {
        console.error('Failed to save recent projects', e);
      }
      
      return newList;
    });
  };
  
  // Pin a project
  const pinProject = (project: Project) => {
    setPinnedProjectIds(prev => {
      if (prev.includes(project.id)) return prev;
      
      const newList = [...prev, project.id];
      
      // Save to localStorage
      try {
        localStorage.setItem(PINNED_PROJECTS_KEY, JSON.stringify(newList));
      } catch (e) {
        console.error('Failed to save pinned projects', e);
      }
      
      toast({
        title: "Project Pinned",
        description: `${project.name} has been pinned to your dashboard.`,
      });
      
      return newList;
    });
  };
  
  // Unpin a project
  const unpinProject = (projectId: number) => {
    setPinnedProjectIds(prev => {
      const newList = prev.filter(id => id !== projectId);
      
      // Save to localStorage
      try {
        localStorage.setItem(PINNED_PROJECTS_KEY, JSON.stringify(newList));
      } catch (e) {
        console.error('Failed to save pinned projects', e);
      }
      
      const projectName = allProjects.find(p => p.id === projectId)?.name || 'Project';
      toast({
        title: "Project Unpinned",
        description: `${projectName} has been removed from your pinned projects.`,
      });
      
      return newList;
    });
  };
  
  // Load recent projects from localStorage when allProjects loads
  useEffect(() => {
    if (allProjects.length > 0) {
      try {
        const savedIds = localStorage.getItem(RECENT_PROJECTS_KEY);
        if (savedIds) {
          const ids = JSON.parse(savedIds) as number[];
          const projects = ids
            .map(id => allProjects.find(p => p.id === id))
            .filter((p): p is Project => p !== undefined);
          setRecentProjects(projects);
        }
      } catch (e) {
        console.error('Failed to load recent projects', e);
      }
    }
  }, [allProjects]);
  
  // When a current project is set, add it to recent projects
  useEffect(() => {
    if (currentProject) {
      addToRecentProjects(currentProject);
    }
  }, [currentProject]);

  return (
    <ProjectContext.Provider value={{ 
      currentProject, 
      setCurrentProject,
      recentProjects,
      addToRecentProjects,
      removeFromRecentProjects,
      isLoadingProjects,
      allProjects,
      refreshProjects: refetch,
      pinnedProjects,
      pinProject,
      unpinProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}

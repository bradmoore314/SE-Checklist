import { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface TopNavProps {
  project: Project | null;
  onToggleSidebar: () => void;
}

export default function TopNav({ project, onToggleSidebar }: TopNavProps) {
  return (
    <header className="bg-white border-b border-neutral-200 flex items-center justify-between px-6 py-3">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onToggleSidebar} 
          className="mr-4 text-neutral-500 hover:text-primary"
        >
          <span className="material-icons">menu</span>
        </Button>
        <div>
          <h1 className="text-xl font-medium">
            {project ? project.name : "Welcome to SE Checklist"}
          </h1>
          <div className="text-sm text-neutral-500">
            {project ? project.client : "Select or create a project to get started"}
          </div>
        </div>
      </div>
      
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-neutral-500 hover:text-primary mr-4"
        >
          <span className="material-icons">notifications</span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-neutral-500 hover:text-primary mr-4"
        >
          <span className="material-icons">help_outline</span>
        </Button>
        <Link href="/projects/new">
          <Button 
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md flex items-center"
          >
            <span className="material-icons mr-1">add</span>
            New
          </Button>
        </Link>
      </div>
    </header>
  );
}

import { useProject } from '@/contexts/ProjectContext';
import { useOpportunity } from '@/contexts/OpportunityContext';
import { useLocation } from 'wouter';

export function DebugInfo() {
  const { currentProject, allProjects, pinnedProjects, recentProjects } = useProject();
  const { currentOpportunity } = useOpportunity();
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 right-0 p-4 bg-black bg-opacity-70 text-white text-xs z-50 w-96 overflow-auto max-h-80">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <div className="mb-2">
        <strong>Current URL:</strong> {location}
      </div>
      <div className="mb-2">
        <strong>Current Project:</strong> {currentProject ? `ID: ${currentProject.id}, Name: ${currentProject.name}` : 'None'}
      </div>
      <div className="mb-2">
        <strong>Current Opportunity:</strong> {currentOpportunity ? `ID: ${currentOpportunity.id}, Name: ${currentOpportunity.name}` : 'None'}
      </div>
      <div className="mb-2">
        <strong>Project Count:</strong> {allProjects.length}
      </div>
      <div className="mb-2">
        <strong>Pinned Projects:</strong> {pinnedProjects.length}
      </div>
      <div className="mb-2">
        <strong>Recent Projects:</strong> {recentProjects.length}
      </div>
    </div>
  );
}
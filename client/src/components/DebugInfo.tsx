import { useProject } from '@/context/ProjectContext';
import { useSiteWalk } from '@/context/SiteWalkContext';

export function DebugInfo() {
  const { currentProject } = useProject();
  const { currentSiteWalk } = useSiteWalk();

  return (
    <div className="fixed bottom-0 right-0 p-4 bg-black bg-opacity-70 text-white text-xs z-50 w-96 overflow-auto max-h-80">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <div className="mb-2">
        <strong>Current Project:</strong> {currentProject ? `ID: ${currentProject.id}, Name: ${currentProject.name}` : 'None'}
      </div>
      <div className="mb-2">
        <strong>Current Site Walk:</strong> {currentSiteWalk ? `ID: ${currentSiteWalk.id}, Name: ${currentSiteWalk.name}` : 'None'}
      </div>
    </div>
  );
}
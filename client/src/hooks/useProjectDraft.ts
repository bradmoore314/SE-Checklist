import { useLocalStorage } from "./useLocalStorage";
import { v4 as uuidv4 } from "uuid";

// Type for draft project data
interface ProjectDraft {
  id: string; // UUID for the draft
  data: Record<string, any>; // Actual form data
  lastUpdated: number; // Timestamp
}

/**
 * Hook for persisting project data before a project is created
 * Prevents data loss in the BDM tab when no project is selected
 * 
 * @param draftType Type of draft (e.g., 'bdm', 'kvg', etc.)
 * @returns [draftData, updateDraft, clearDraft] - The draft data and functions to update or clear it
 */
export function useProjectDraft(draftType: string) {
  const storageKey = `project_draft_${draftType}`;
  
  const [draft, setDraft] = useLocalStorage<ProjectDraft | null>(storageKey, null);
  
  /**
   * Initialize or update the draft with new data
   */
  const updateDraft = (data: Record<string, any>) => {
    const currentDraft = draft || {
      id: uuidv4(),
      data: {},
      lastUpdated: Date.now()
    };
    
    setDraft({
      ...currentDraft,
      data: {
        ...currentDraft.data,
        ...data
      },
      lastUpdated: Date.now()
    });
  };
  
  /**
   * Clear the draft data
   */
  const clearDraft = () => {
    setDraft(null);
  };
  
  return [draft?.data || {}, updateDraft, clearDraft] as const;
}
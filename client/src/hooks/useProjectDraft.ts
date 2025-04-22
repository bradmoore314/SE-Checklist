import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useLocalStorage } from './useLocalStorage';

/**
 * Interface for draft data (saved locally while no project is selected)
 */
export interface ProjectDraft {
  id: string; // Temporary UUID to identify the draft
  formData: any; // The actual form data
  lastUpdated: number; // Timestamp for when the draft was last updated
  projectId?: number; // The project ID once assigned
}

/**
 * Hook to persist draft data in localStorage when no project is selected
 * Prevents data loss when users have to create a project after entering BDM data
 * 
 * @param formData Current form data
 * @param projectId Current project ID (undefined if no project selected)
 * @param onRestoreDraft Callback to restore the form data when a draft is found
 * @returns Object with draft operations and status
 */
export function useProjectDraft(
  formData: any,
  projectId: number | undefined,
  onRestoreDraft: (data: any) => void
) {
  // Use localStorage to store the draft
  const [drafts, setDrafts] = useLocalStorage<ProjectDraft[]>('kvg-project-drafts', []);
  
  // Current draft ID - stored separately to ensure consistency
  const [currentDraftId, setCurrentDraftId] = useLocalStorage<string | null>('kvg-current-draft-id', null);
  
  // Save draft when form data changes and no project is selected
  useEffect(() => {
    if (!projectId && Object.keys(formData).length > 0) {
      // Ensure we have a current draft ID
      let draftId = currentDraftId;
      if (!draftId) {
        draftId = uuidv4();
        setCurrentDraftId(draftId);
      }
      
      // Update or create the draft
      const draft: ProjectDraft = {
        id: draftId,
        formData,
        lastUpdated: Date.now()
      };
      
      // Find and update existing draft or add new one
      const existingDraftIndex = drafts.findIndex(d => d.id === draftId);
      
      if (existingDraftIndex !== -1) {
        // Update existing draft
        const updatedDrafts = [...drafts];
        updatedDrafts[existingDraftIndex] = draft;
        setDrafts(updatedDrafts);
      } else {
        // Add new draft
        setDrafts([...drafts, draft]);
      }
    }
  }, [formData, projectId]);
  
  // When project ID is assigned, associate it with the current draft
  useEffect(() => {
    if (projectId && currentDraftId) {
      // Associate draft with project
      const existingDraftIndex = drafts.findIndex(d => d.id === currentDraftId);
      
      if (existingDraftIndex !== -1) {
        const updatedDrafts = [...drafts];
        updatedDrafts[existingDraftIndex] = {
          ...updatedDrafts[existingDraftIndex],
          projectId
        };
        setDrafts(updatedDrafts);
      }
      
      // Clear current draft since it's now associated with a project
      setCurrentDraftId(null);
    }
  }, [projectId, currentDraftId]);
  
  // Try to restore draft for the current project or the current draft
  useEffect(() => {
    if (drafts.length > 0) {
      let draftToRestore: ProjectDraft | undefined;
      
      if (projectId) {
        // If we have a project ID, look for a matching draft
        draftToRestore = drafts.find(d => d.projectId === projectId);
      } else if (currentDraftId) {
        // Otherwise use the current draft if available
        draftToRestore = drafts.find(d => d.id === currentDraftId);
      }
      
      // If we found a draft and it has data, restore it
      if (draftToRestore && Object.keys(draftToRestore.formData).length > 0) {
        onRestoreDraft(draftToRestore.formData);
      }
    }
  }, [drafts, projectId, currentDraftId]);
  
  // Function to clear drafts
  const clearDrafts = () => {
    setDrafts([]);
    setCurrentDraftId(null);
  };
  
  // Function to clear a specific draft
  const clearDraft = (draftId: string) => {
    setDrafts(drafts.filter(d => d.id !== draftId));
    if (currentDraftId === draftId) {
      setCurrentDraftId(null);
    }
  };
  
  return {
    drafts,
    currentDraftId,
    hasDraft: !!currentDraftId,
    clearDrafts,
    clearDraft
  };
}
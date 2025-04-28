import { db } from "../db";
import { createGraphClient, createSharePointFolder, uploadFileToSharePoint, isSharePointConfigured } from "./microsoft-graph";
import { projects, Project } from "@shared/schema";
import { eq } from "drizzle-orm";
import "isomorphic-fetch";

// Mock interfaces until we properly implement CRM features
interface CrmSettings {
  id: number;
  crm_type: string;
  base_url?: string;
  api_version?: string;
  settings?: Record<string, any>;
}

interface EquipmentImage {
  id: number;
  project_id: number;
  equipment_type: string;
  equipment_id: number;
  image_data: string;
  sharepoint_file_id?: string | null;
  sharepoint_url?: string | null;
}

// Mock table variables for type checking
const equipmentImages = {
  project_id: { name: 'project_id' },
  id: { name: 'id' },
  sharepoint_file_id: 'sharepoint_file_id',
  sharepoint_url: 'sharepoint_url'
};

enum equipmentTypeEnum {
  ACCESS_POINT = 'access_point',
  CAMERA = 'camera',
  ELEVATOR = 'elevator',
  INTERCOM = 'intercom'
}

// Type definition for CRM settings
interface SharePointSettings {
  sharePointSiteId: string;
  sharePointDriveId: string;
  opportunitiesFolderId?: string;
}

// Helper function to safely parse SharePoint settings
function parseSharePointSettings(settings: CrmSettings): SharePointSettings | null {
  if (!settings || !settings.settings) {
    return null;
  }
  
  try {
    const settingsObj = settings.settings as Record<string, any>;
    
    if (!settingsObj.sharePointSiteId || !settingsObj.sharePointDriveId) {
      return null;
    }
    
    return {
      sharePointSiteId: settingsObj.sharePointSiteId,
      sharePointDriveId: settingsObj.sharePointDriveId,
      opportunitiesFolderId: settingsObj.opportunitiesFolderId
    };
  } catch (error) {
    console.error("Error parsing SharePoint settings:", error);
    return null;
  }
}

import { createDataverseToken } from "./microsoft-graph";

// Utility function to make authenticated API calls to Dataverse
async function callDataverseApi(
  url: string, 
  method: string = 'GET', 
  body?: any, 
  accessToken?: string,
  baseUrl?: string
): Promise<any> {
  let token = accessToken;
  
  // If no token provided but baseUrl is, try to get a token
  if (!token && baseUrl) {
    // Default to first user (1) for now
    // In a real implementation, we would use the logged-in user
    const dataverseToken = await createDataverseToken(1, baseUrl);
    token = dataverseToken || undefined;
    
    if (!token) {
      throw new Error("Failed to acquire Dataverse API token");
    }
  } else if (!token) {
    throw new Error("No access token or baseUrl provided for Dataverse API");
  }
  
  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0'
  };
  
  if (body && method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }
  
  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Dataverse API error (${response.status}): ${errorText}`);
    }
    
    // Some endpoints return no content
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error calling Dataverse API:", error);
    throw error;
  }
}

// Interface for any CRM system we want to integrate with
export interface CrmSystem {
  name: string;
  isConfigured(): Promise<boolean>;
  createOpportunity(projectData: Project): Promise<{ id: string; name: string }>;
  updateOpportunity(opportunityId: string, projectData: Project): Promise<void>;
  syncAttachments(projectId: number, opportunityId: string): Promise<void>;
  getSettings(): Promise<CrmSettings | undefined>;
}

// Microsoft Dynamics 365 implementation
export class DynamicsCrm implements CrmSystem {
  name = "dynamics365";
  
  async isConfigured(): Promise<boolean> {
    const settings = await this.getSettings();
    return !!settings && isSharePointConfigured();
  }
  
  async getSettings(): Promise<CrmSettings | undefined> {
    // Mock implementation since we haven't yet created the crmSettings table
    // In a real implementation, we would query the database
    const settings: CrmSettings = {
      id: 1,
      crm_type: this.name,
      base_url: "https://example.crm.dynamics.com",
      api_version: "v9.2",
      settings: {
        sharePointSiteId: "mock-site-id",
        sharePointDriveId: "mock-drive-id"
      }
    };
    
    return settings;
  }
  
  async createOpportunity(projectData: Project): Promise<{ id: string; name: string }> {
    // This would be implemented with actual Dynamics 365 API calls
    // For now, we'll simulate creating an opportunity
    const settings = await this.getSettings();
    
    if (!settings) {
      throw new Error("Dynamics 365 CRM not configured");
    }
    
    // In a real implementation, this would make API calls to Dynamics 365
    console.log("Creating opportunity in Dynamics 365:", projectData.name);
    
    // Simulate creating an opportunity
    const opportunityId = `opp_${Date.now()}`;
    const opportunityName = projectData.name;
    
    // Create SharePoint folder for this opportunity
    await this.createSharePointFolder(projectData.id, opportunityId, opportunityName);
    
    return {
      id: opportunityId,
      name: opportunityName
    };
  }
  
  async updateOpportunity(opportunityId: string, projectData: Project): Promise<void> {
    // This would be implemented with actual Dynamics 365 API calls
    // For now, we'll just log the update
    console.log(`Updating opportunity ${opportunityId} in Dynamics 365:`, projectData.name);
  }
  
  async syncAttachments(projectId: number, opportunityId: string): Promise<void> {
    // 1. Get all the images for this project
    const images = await db
      .select()
      .from(equipmentImages as any)
      .where(eq(equipmentImages.project_id as any, projectId));
    
    if (images.length === 0) {
      console.log("No images to sync for project", projectId);
      return;
    }
    
    // 2. Get the project to know SharePoint folder details
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));
    
    if (!project || !project.sharepoint_folder_id) {
      throw new Error("Project has no SharePoint folder");
    }
    
    // 3. Upload any images that don't have a SharePoint ID yet
    for (const image of images) {
      if (image.sharepoint_file_id) {
        continue; // Already synced
      }
      
      // Get the userId from somewhere - for now hardcode to 1 (first user)
      const client = createGraphClient(1);
      
      if (!client) {
        throw new Error("Could not create Graph client");
      }
      
      // Create a meaningful filename based on equipment type and location
      const equipmentType = image.equipment_type;
      const fileName = `${equipmentType}_${image.equipment_id}_${Date.now()}.jpg`;
      
      // Convert base64 data to Buffer
      const imageBuffer = Buffer.from(image.image_data.split(',')[1], 'base64');
      
      // Upload to SharePoint
      if (!project.sharepoint_site_id || !project.sharepoint_drive_id || !project.sharepoint_folder_id) {
        throw new Error("SharePoint folder information is incomplete for this project");
      }
      
      const result = await uploadFileToSharePoint(
        client,
        project.sharepoint_site_id,
        project.sharepoint_drive_id,
        project.sharepoint_folder_id,
        fileName,
        imageBuffer,
        'image/jpeg'
      );
      
      // Update the image record with SharePoint info
      await db
        .update(equipmentImages as any)
        .set({
          sharepoint_file_id: result.id,
          sharepoint_url: result.webUrl
        })
        .where(eq(equipmentImages.id as any, image.id));
    }
  }
  
  private async createSharePointFolder(
    projectId: number, 
    opportunityId: string, 
    folderName: string
  ): Promise<void> {
    if (!isSharePointConfigured()) {
      console.log("SharePoint not configured, skipping folder creation");
      return;
    }
    
    // Get settings for SharePoint site/drive info
    const settings = await this.getSettings();
    
    // Safely parse SharePoint settings only if settings exists
    const sharePointSettings = settings ? parseSharePointSettings(settings) : null;
    
    if (!sharePointSettings) {
      throw new Error("SharePoint settings not configured or incomplete");
    }
    
    const { sharePointSiteId, sharePointDriveId, opportunitiesFolderId } = sharePointSettings;
    
    // Create folder in SharePoint
    // Get the userId from somewhere - for now hardcode to 1 (first user)
    const client = createGraphClient(1);
    
    if (!client) {
      throw new Error("Could not create Graph client");
    }
    
    const parentFolderId = opportunitiesFolderId || "root";
    
    const result = await createSharePointFolder(
      client,
      sharePointSiteId,
      sharePointDriveId,
      folderName,
      parentFolderId
    );
    
    // Update project with SharePoint folder info
    await db
      .update(projects)
      .set({
        sharepoint_folder_url: result.webUrl,
        sharepoint_site_id: sharePointSiteId,
        sharepoint_drive_id: sharePointDriveId,
        sharepoint_folder_id: result.id,
      })
      .where(eq(projects.id, projectId));
  }
}

// Microsoft Dataverse implementation
// Helper function to get a CRM system by name
export function getCrmSystem(crmType: string): CrmSystem | null {
  switch (crmType) {
    case 'dynamics365':
      return new DynamicsCrm();
    case 'dataverse':
      return new DataverseCrm();
    default:
      return null;
  }
}

// Helper function to link a project to a CRM opportunity
export async function linkProjectToCrm(
  projectId: number, 
  crmType: string, 
  opportunityId?: string
): Promise<{ success: boolean; message: string; opportunityId?: string; opportunityName?: string }> {
  try {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));
      
    if (!project) {
      return { success: false, message: "Project not found" };
    }
    
    const crmSystem = getCrmSystem(crmType);
    
    if (!crmSystem) {
      return { success: false, message: `CRM system ${crmType} not found` };
    }
    
    // If an opportunity ID is provided, link to existing opportunity
    if (opportunityId) {
      // Update the opportunity with latest project data
      await crmSystem.updateOpportunity(opportunityId, project);
      
      // Update project with CRM details
      await db
        .update(projects)
        .set({
          crm_opportunity_id: opportunityId,
          crm_last_synced: new Date()
        })
        .where(eq(projects.id, projectId));
        
      // Sync any images/attachments
      await crmSystem.syncAttachments(projectId, opportunityId);
      
      return { 
        success: true, 
        message: "Project linked to existing opportunity", 
        opportunityId 
      };
    } else {
      // Create a new opportunity
      const result = await crmSystem.createOpportunity(project);
      
      // Update project with CRM details
      await db
        .update(projects)
        .set({
          crm_opportunity_id: result.id,
          crm_opportunity_name: result.name,
          crm_last_synced: new Date()
        })
        .where(eq(projects.id, projectId));
        
      // Sync any images/attachments
      await crmSystem.syncAttachments(projectId, result.id);
      
      return { 
        success: true, 
        message: "New opportunity created and linked", 
        opportunityId: result.id,
        opportunityName: result.name
      };
    }
  } catch (error) {
    console.error("Error linking project to CRM:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return { success: false, message: errorMessage };
  }
}

export class DataverseCrm implements CrmSystem {
  name = "dataverse";
  
  async isConfigured(): Promise<boolean> {
    const settings = await this.getSettings();
    return !!settings && isSharePointConfigured();
  }
  
  async getSettings(): Promise<CrmSettings | undefined> {
    // Mock implementation since we haven't yet created the crmSettings table
    // In a real implementation, we would query the database
    const settings: CrmSettings = {
      id: 1,
      crm_type: this.name,
      base_url: "https://example.dataverse.com",
      api_version: "v9.2",
      settings: {
        sharePointSiteId: "mock-site-id",
        sharePointDriveId: "mock-drive-id"
      }
    };
    
    return settings;
  }
  
  async createOpportunity(projectData: Project): Promise<{ id: string; name: string }> {
    // Get Dataverse settings
    const settings = await this.getSettings();
    
    if (!settings) {
      throw new Error("Dataverse CRM not configured");
    }
    
    // Get API configuration from settings
    const dataverseUrl = settings.base_url;
    const apiVersion = settings.api_version || "v9.2";
    
    // Make sure Microsoft authentication is configured
    if (!isSharePointConfigured()) {
      throw new Error("Microsoft authentication not configured");
    }
    
    try {
      // Prepare the opportunity data for Dataverse
      // Field names would match the Dataverse entity schema
      const opportunityData = {
        name: projectData.name,
        description: `Project at ${projectData.site_address}`,
        // Map other relevant fields
        customerid_account: {
          name: projectData.client,
          accountid: null // In a real implementation, we would look up or create the account
        },
        // Other fields as needed
      };
      
      // In a real implementation, we would create the opportunity in Dataverse
      // For demonstration purposes, we'll simulate success and create a SharePoint folder
      console.log(`Creating opportunity in Dataverse at ${dataverseUrl}: ${projectData.name}`);
      
      // For now, simulate the response
      // In a real implementation, we would call Dataverse API:
      /*
      const response = await callDataverseApi(
        `${dataverseUrl}/api/data/${apiVersion}/opportunities`, 
        'POST',
        opportunityData,
        null,
        dataverseUrl
      );
      
      const opportunityId = response.opportunityid;
      const opportunityName = response.name;
      */
      
      // Simulated response
      const opportunityId = `dataverse_opp_${Date.now()}`;
      const opportunityName = projectData.name;
      
      // Create SharePoint folder for documents
      await this.createSharePointFolder(projectData.id, opportunityId, opportunityName);
      
      return {
        id: opportunityId,
        name: opportunityName
      };
    } catch (error) {
      console.error("Error creating opportunity in Dataverse:", error);
      throw error;
    }
  }
  
  async updateOpportunity(opportunityId: string, projectData: Project): Promise<void> {
    const settings = await this.getSettings();
    
    if (!settings) {
      throw new Error("Dataverse CRM not configured");
    }
    
    // Get API configuration from settings
    const dataverseUrl = settings.base_url;
    const apiVersion = settings.api_version || "v9.2";
    
    try {
      // Prepare update data for Dataverse
      const updateData = {
        name: projectData.name,
        description: `Project at ${projectData.site_address}`,
        // Additional fields as needed
      };
      
      // For now, we'll just log what we would do
      console.log(`Updating opportunity ${opportunityId} in Dataverse: ${projectData.name}`);
      
      // In a real implementation, we would call Dataverse API:
      /*
      await callDataverseApi(
        `${dataverseUrl}/api/data/${apiVersion}/opportunities(${opportunityId})`, 
        'PATCH',
        updateData,
        null,
        dataverseUrl
      );
      */
    } catch (error) {
      console.error("Error updating opportunity in Dataverse:", error);
      throw error;
    }
  }
  
  async syncAttachments(projectId: number, opportunityId: string): Promise<void> {
    // Similar implementation to DynamicsCrm.syncAttachments
    
    // 1. Get all the images for this project
    const images = await db
      .select()
      .from(equipmentImages as any)
      .where(eq(equipmentImages.project_id as any, projectId));
    
    if (images.length === 0) {
      console.log("No images to sync for project", projectId);
      return;
    }
    
    // 2. Get the project to know SharePoint folder details
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));
    
    if (!project || !project.sharepoint_folder_id) {
      throw new Error("Project has no SharePoint folder");
    }
    
    // 3. Upload any images that don't have a SharePoint ID yet
    for (const image of images) {
      if (image.sharepoint_file_id) {
        continue; // Already synced
      }
      
      // Get the userId from somewhere - for now hardcode to 1 (first user)
      const client = createGraphClient(1);
      
      if (!client) {
        throw new Error("Could not create Graph client");
      }
      
      // Create a meaningful filename based on equipment type and location
      const equipmentType = image.equipment_type;
      const fileName = `${equipmentType}_${image.equipment_id}_${Date.now()}.jpg`;
      
      // Convert base64 data to Buffer
      const imageBuffer = Buffer.from(image.image_data.split(',')[1], 'base64');
      
      // Upload to SharePoint
      if (!project.sharepoint_site_id || !project.sharepoint_drive_id || !project.sharepoint_folder_id) {
        throw new Error("SharePoint folder information is incomplete for this project");
      }
      
      const result = await uploadFileToSharePoint(
        client,
        project.sharepoint_site_id,
        project.sharepoint_drive_id,
        project.sharepoint_folder_id,
        fileName,
        imageBuffer,
        'image/jpeg'
      );
      
      // Update the image record with SharePoint info
      await db
        .update(equipmentImages as any)
        .set({
          sharepoint_file_id: result.id,
          sharepoint_url: result.webUrl
        })
        .where(eq(equipmentImages.id as any, image.id));
    }
    
    // In a real implementation, we would also create annotations in Dataverse
    // linking to these SharePoint documents
    console.log(`Synced ${images.length} attachments to Dataverse opportunity ${opportunityId}`);
  }
  
  private async createSharePointFolder(
    projectId: number, 
    opportunityId: string, 
    folderName: string
  ): Promise<void> {
    if (!isSharePointConfigured()) {
      console.log("SharePoint not configured, skipping folder creation");
      return;
    }
    
    // Get settings for SharePoint site/drive info
    const settings = await this.getSettings();
    
    // Safely parse SharePoint settings only if settings exists
    const sharePointSettings = settings ? parseSharePointSettings(settings) : null;
    
    if (!sharePointSettings) {
      throw new Error("SharePoint settings not configured or incomplete");
    }
    
    const { sharePointSiteId, sharePointDriveId, opportunitiesFolderId } = sharePointSettings;
    
    // Create folder in SharePoint
    // Get the userId from somewhere - for now hardcode to 1 (first user)
    const client = createGraphClient(1);
    
    if (!client) {
      throw new Error("Could not create Graph client");
    }
    
    const parentFolderId = opportunitiesFolderId || "root";
    
    const result = await createSharePointFolder(
      client,
      sharePointSiteId,
      sharePointDriveId,
      folderName,
      parentFolderId
    );
    
    // Update project with SharePoint folder info
    await db
      .update(projects)
      .set({
        sharepoint_folder_url: result.webUrl,
        sharepoint_site_id: sharePointSiteId,
        sharepoint_drive_id: sharePointDriveId,
        sharepoint_folder_id: result.id,
      })
      .where(eq(projects.id, projectId));
  }
}
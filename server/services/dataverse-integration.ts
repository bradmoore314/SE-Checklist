import { storage } from "../storage";
import fetch from "node-fetch";
import { createInsertable, eq } from "drizzle-orm";
import { crmSettings } from "@shared/schema";

class DataverseIntegration {
  private token: string | null = null;
  private tokenExpiration: Date | null = null;
  private baseUrl: string | null = null;
  private apiVersion: string | null = null;
  private clientId: string | null = null;
  private clientSecret: string | null = null;
  private tenantId: string | null = null;
  private initializedAt: Date | null = null;

  constructor() {
    this.initializedAt = new Date();
    console.log(`Dataverse integration service created at ${this.initializedAt.toISOString()}`);
  }

  /**
   * Load configuration from the database
   */
  async loadConfiguration(): Promise<boolean> {
    try {
      const settings = await storage.getCrmSettingByType("dataverse");
      if (!settings) {
        console.log("No Dataverse configuration found in database");
        return false;
      }

      this.baseUrl = settings.base_url;
      this.apiVersion = settings.api_version;

      if (settings.settings) {
        try {
          const parsedSettings = JSON.parse(settings.settings);
          this.clientId = parsedSettings.clientId;
          this.clientSecret = parsedSettings.clientSecret;
          this.tenantId = parsedSettings.tenantId;
        } catch (e) {
          console.error("Failed to parse Dataverse settings JSON:", e);
          return false;
        }
      }

      console.log(`Loaded Dataverse configuration: ${this.baseUrl}, API version: ${this.apiVersion}`);
      return true;
    } catch (error) {
      console.error("Error loading Dataverse configuration:", error);
      return false;
    }
  }

  /**
   * Get an authentication token from Microsoft Identity Platform
   */
  private async getToken(): Promise<string> {
    if (this.token && this.tokenExpiration && this.tokenExpiration > new Date()) {
      // Use existing token if it's still valid
      return this.token;
    }

    if (!this.tenantId || !this.clientId || !this.clientSecret) {
      throw new Error("Dataverse credentials not configured");
    }

    if (!this.baseUrl) {
      throw new Error("Dataverse base URL not configured");
    }

    // Get new token
    const tokenUrl = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    
    const formData = new URLSearchParams();
    formData.append("client_id", this.clientId);
    formData.append("client_secret", this.clientSecret);
    formData.append("grant_type", "client_credentials");
    formData.append("scope", `${this.baseUrl}/.default`);

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get token: ${response.status} ${errorText}`);
    }

    const data = await response.json() as { access_token: string; expires_in: number };
    this.token = data.access_token;
    this.tokenExpiration = new Date(Date.now() + (data.expires_in * 1000 * 0.9)); // 90% of the expiration time

    return this.token;
  }

  /**
   * Test connection to Dataverse
   */
  async testConnection(url: string, clientId: string, clientSecret: string, tenantId: string): Promise<boolean> {
    try {
      // Store original values
      const originalBaseUrl = this.baseUrl;
      const originalClientId = this.clientId;
      const originalClientSecret = this.clientSecret;
      const originalTenantId = this.tenantId;

      // Set temporary values for the test
      this.baseUrl = url;
      this.clientId = clientId;
      this.clientSecret = clientSecret;
      this.tenantId = tenantId;

      // Clear token to force a new one
      this.token = null;
      this.tokenExpiration = null;

      // Try to get a token
      await this.getToken();

      // If we get here, the connection was successful
      // Restore original values
      this.baseUrl = originalBaseUrl;
      this.clientId = originalClientId;
      this.clientSecret = originalClientSecret;
      this.tenantId = originalTenantId;
      this.token = null;
      this.tokenExpiration = null;

      return true;
    } catch (error) {
      console.error("Dataverse connection test failed:", error);
      return false;
    }
  }

  /**
   * Get a list of opportunities from Dataverse
   */
  async getOpportunities(): Promise<any[]> {
    try {
      if (!this.baseUrl || !this.apiVersion) {
        throw new Error("Dataverse not properly configured");
      }

      const token = await this.getToken();
      const endpoint = `${this.baseUrl}/api/data/v${this.apiVersion}/opportunities`;
      
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch opportunities: ${response.status} ${errorText}`);
      }

      const data = await response.json() as { value: any[] };
      return data.value;
    } catch (error) {
      console.error("Error fetching opportunities from Dataverse:", error);
      return [];
    }
  }

  /**
   * Get a specific opportunity from Dataverse
   */
  async getOpportunity(opportunityId: string): Promise<any | null> {
    try {
      if (!this.baseUrl || !this.apiVersion) {
        throw new Error("Dataverse not properly configured");
      }

      const token = await this.getToken();
      const endpoint = `${this.baseUrl}/api/data/v${this.apiVersion}/opportunities(${opportunityId})`;
      
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        const errorText = await response.text();
        throw new Error(`Failed to fetch opportunity: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching opportunity from Dataverse:", error);
      return null;
    }
  }

  /**
   * Link a project to an opportunity in Dataverse
   */
  async linkProjectToOpportunity(projectId: number, opportunityId: string): Promise<boolean> {
    try {
      // First, check if the project exists
      const project = await storage.getProject(projectId);
      if (!project) {
        throw new Error(`Project with ID ${projectId} does not exist`);
      }

      // Check if the opportunity exists
      const opportunity = await this.getOpportunity(opportunityId);
      if (!opportunity) {
        throw new Error(`Opportunity with ID ${opportunityId} does not exist in Dataverse`);
      }

      // Update the project with the opportunity ID
      const updated = await storage.updateProject(projectId, {
        crm_id: opportunityId,
        crm_type: "dataverse",
      });

      return !!updated;
    } catch (error) {
      console.error(`Error linking project ${projectId} to opportunity ${opportunityId}:`, error);
      return false;
    }
  }

  /**
   * Synchronize projects with opportunities in Dataverse
   */
  async syncProjects(): Promise<{ syncedProjects: number; errors: string[] }> {
    const syncResults = {
      syncedProjects: 0,
      errors: [] as string[],
    };

    try {
      // Get all opportunities from Dataverse
      const opportunities = await this.getOpportunities();
      if (!opportunities.length) {
        syncResults.errors.push("No opportunities found in Dataverse");
        return syncResults;
      }

      // Get all projects
      const projects = await storage.getProjects();
      
      // For each opportunity, check if there's a matching project
      for (const opportunity of opportunities) {
        try {
          const opportunityName = opportunity.name;
          const opportunityId = opportunity.opportunityid;
          
          // Look for a project with the same name
          const matchingProject = projects.find(p => p.name === opportunityName);
          
          if (matchingProject) {
            // Update the project with the opportunity ID if it doesn't already have it
            if (matchingProject.crm_id !== opportunityId || matchingProject.crm_type !== "dataverse") {
              await storage.updateProject(matchingProject.id, {
                crm_id: opportunityId,
                crm_type: "dataverse",
              });
              syncResults.syncedProjects++;
            }
          } else {
            // Create a new project for this opportunity
            const newProject = await storage.createProject({
              name: opportunityName,
              client: opportunity.parentaccountid?.name || "Unknown",
              site_address: opportunity.address1_composite || "",
              crm_id: opportunityId,
              crm_type: "dataverse",
              se_name: opportunity._ownerid_value_name || "",
              bdm_name: opportunity._createdby_value_name || "",
            });
            
            if (newProject) {
              syncResults.syncedProjects++;
            }
          }
        } catch (error) {
          console.error(`Error syncing opportunity ${opportunity.opportunityid}:`, error);
          syncResults.errors.push(`Failed to sync opportunity ${opportunity.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      return syncResults;
    } catch (error) {
      console.error("Error during project synchronization:", error);
      syncResults.errors.push(`Synchronization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return syncResults;
    }
  }

  /**
   * Search for opportunities in Dataverse
   */
  async searchOpportunities(searchText: string): Promise<any[]> {
    try {
      if (!this.baseUrl || !this.apiVersion) {
        throw new Error("Dataverse not properly configured");
      }

      if (!searchText) {
        return [];
      }

      const token = await this.getToken();
      const endpoint = `${this.baseUrl}/api/data/v${this.apiVersion}/opportunities?$filter=contains(name,'${encodeURIComponent(searchText)}')`;
      
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "OData-MaxVersion": "4.0",
          "OData-Version": "4.0",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to search opportunities: ${response.status} ${errorText}`);
      }

      const data = await response.json() as { value: any[] };
      return data.value;
    } catch (error) {
      console.error("Error searching opportunities in Dataverse:", error);
      return [];
    }
  }
}

export const dataverseIntegration = new DataverseIntegration();
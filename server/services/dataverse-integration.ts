import fetch from "node-fetch";
import { storage } from "../storage";

interface DataverseCredentials {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  baseUrl: string;
}

interface DataverseAuthentication {
  accessToken: string;
  expiresAt: Date;
}

class DataverseIntegration {
  private credentials: DataverseCredentials | null = null;
  private auth: DataverseAuthentication | null = null;
  
  /**
   * Configure the Dataverse integration with the provided credentials
   */
  configure(credentials: DataverseCredentials): void {
    this.credentials = credentials;
    this.auth = null; // Reset authentication when reconfigured
  }
  
  /**
   * Load configuration from database (if available)
   */
  async loadConfiguration(): Promise<boolean> {
    try {
      const dataverseSetting = await storage.getCrmSettingByType('dataverse');
      
      if (!dataverseSetting || !dataverseSetting.settings) {
        console.log("No Dataverse configuration found in database");
        return false;
      }
      
      try {
        const settings = JSON.parse(dataverseSetting.settings);
        
        if (!settings.clientId || !settings.clientSecret || !settings.tenantId || !settings.baseUrl) {
          console.log("Incomplete Dataverse configuration found");
          return false;
        }
        
        this.credentials = {
          clientId: settings.clientId,
          clientSecret: settings.clientSecret,
          tenantId: settings.tenantId,
          baseUrl: settings.baseUrl
        };
        
        return true;
      } catch (error) {
        console.error("Error parsing Dataverse settings JSON:", error);
        return false;
      }
    } catch (error) {
      console.error("Error loading Dataverse configuration:", error);
      return false;
    }
  }
  
  /**
   * Test connection to Dataverse
   */
  async testConnection(credentials?: DataverseCredentials): Promise<boolean> {
    try {
      // Use provided credentials or fall back to configured ones
      const creds = credentials || this.credentials;
      
      if (!creds) {
        throw new Error("Dataverse credentials not configured");
      }
      
      // Try to get an access token
      await this.getAccessToken(creds);
      
      // If we got here, authentication was successful
      return true;
    } catch (error) {
      console.error("Dataverse connection test failed:", error);
      return false;
    }
  }
  
  /**
   * Get access token for Dataverse API
   */
  private async getAccessToken(credentials?: DataverseCredentials): Promise<string> {
    const creds = credentials || this.credentials;
    
    if (!creds) {
      throw new Error("Dataverse credentials not configured");
    }
    
    // Check if we have a valid token already
    if (this.auth && this.auth.expiresAt > new Date()) {
      return this.auth.accessToken;
    }
    
    // We need to request a new token
    const tokenEndpoint = `https://login.microsoftonline.com/${creds.tenantId}/oauth2/v2.0/token`;
    const scope = `${creds.baseUrl}/.default`;
    
    const body = new URLSearchParams({
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      grant_type: 'client_credentials',
      scope: scope
    });
    
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText} - ${errorData}`);
    }
    
    const data = await response.json() as any;
    
    // Calculate expiration time (subtract 5 minutes for safety)
    const expiresIn = data.expires_in || 3600;
    const expiresAt = new Date(Date.now() + (expiresIn - 300) * 1000);
    
    // Save the token
    this.auth = {
      accessToken: data.access_token,
      expiresAt
    };
    
    return this.auth.accessToken;
  }
  
  /**
   * Fetch accounts from Dataverse
   */
  async fetchAccounts(limit: number = 50): Promise<any[]> {
    try {
      const token = await this.getAccessToken();
      
      if (!this.credentials) {
        throw new Error("Dataverse credentials not configured");
      }
      
      const endpoint = `${this.credentials.baseUrl}/api/data/v9.2/accounts?$top=${limit}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch accounts: ${response.status} ${response.statusText} - ${errorData}`);
      }
      
      const data = await response.json() as any;
      return data.value || [];
    } catch (error) {
      console.error("Error fetching Dataverse accounts:", error);
      throw error;
    }
  }
  
  /**
   * Fetch opportunities from Dataverse
   */
  async fetchOpportunities(limit: number = 50): Promise<any[]> {
    try {
      const token = await this.getAccessToken();
      
      if (!this.credentials) {
        throw new Error("Dataverse credentials not configured");
      }
      
      const endpoint = `${this.credentials.baseUrl}/api/data/v9.2/opportunities?$top=${limit}`;
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'OData-MaxVersion': '4.0',
          'OData-Version': '4.0'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch opportunities: ${response.status} ${response.statusText} - ${errorData}`);
      }
      
      const data = await response.json() as any;
      return data.value || [];
    } catch (error) {
      console.error("Error fetching Dataverse opportunities:", error);
      throw error;
    }
  }
  
  /**
   * Sync projects with Dataverse opportunities
   */
  async syncProjects(): Promise<{
    synced: number;
    created: number;
    updated: number;
    failed: number;
  }> {
    // This would be implemented to:
    // 1. Fetch opportunities from Dataverse
    // 2. Fetch accounts from Dataverse (to get account details for opportunities)
    // 3. For each opportunity, look for matching project in our system
    // 4. Create or update projects as needed
    
    // For now, return placeholder statistics
    return {
      synced: 0,
      created: 0,
      updated: 0,
      failed: 0
    };
  }
}

// Export a singleton instance
export const dataverseIntegration = new DataverseIntegration();
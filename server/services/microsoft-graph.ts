import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import "isomorphic-fetch";

// A simple token provider that uses refresh token to get access tokens
class RefreshTokenProvider {
  private refreshToken: string;
  private clientId: string;
  private clientSecret: string;
  private tenantId: string;
  private tokenExpiryTime: number = 0;
  private accessToken: string = "";
  private scope: string;
  
  // Cache for different scopes
  private static tokenCache: Map<string, { token: string, expiryTime: number }> = new Map();

  constructor(refreshToken: string, clientId: string, clientSecret: string, tenantId: string, scope: string = "https://graph.microsoft.com/.default") {
    this.refreshToken = refreshToken;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.tenantId = tenantId;
    this.scope = scope;
    
    // Check cache first
    const cacheKey = `${this.refreshToken}_${this.scope}`;
    const cachedToken = RefreshTokenProvider.tokenCache.get(cacheKey);
    if (cachedToken) {
      this.accessToken = cachedToken.token;
      this.tokenExpiryTime = cachedToken.expiryTime;
    }
  }

  async getToken(): Promise<string> {
    // If token is still valid, return it
    if (this.accessToken && this.tokenExpiryTime > Date.now()) {
      return this.accessToken;
    }

    // Otherwise, get a new token
    const tokenEndpoint = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;
    
    const formData = new URLSearchParams();
    formData.append("client_id", this.clientId);
    formData.append("scope", this.scope);
    formData.append("refresh_token", this.refreshToken);
    formData.append("grant_type", "refresh_token");
    formData.append("client_secret", this.clientSecret);

    try {
      const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${data.error_description || data.error || "Unknown error"}`);
      }

      this.accessToken = data.access_token;
      // Set expiry time with a 5-minute buffer
      this.tokenExpiryTime = Date.now() + (data.expires_in * 1000) - (5 * 60 * 1000);
      
      // Cache the token
      const cacheKey = `${this.refreshToken}_${this.scope}`;
      RefreshTokenProvider.tokenCache.set(cacheKey, {
        token: this.accessToken,
        expiryTime: this.tokenExpiryTime
      });
      
      // Update refresh token if provided
      if (data.refresh_token) {
        this.refreshToken = data.refresh_token;
      }

      return this.accessToken;
    } catch (error) {
      console.error("Error refreshing token:", error);
      throw error;
    }
  }
}

export function createGraphClient(userId: number): Client | null {
  // This function will get the user from the database and create a Graph client
  // based on their stored refresh token
  try {
    // Mock implementation - replace with actual user retrieval
    // const user = await storage.getUser(userId);
    const user = { refreshToken: process.env.MS_REFRESH_TOKEN || null };
    
    if (!user.refreshToken) {
      console.error("User has no refresh token");
      return null;
    }

    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const tenantId = process.env.AZURE_TENANT_ID;

    if (!clientId || !clientSecret || !tenantId) {
      console.error("Missing Azure AD app credentials");
      return null;
    }

    const tokenProvider = new RefreshTokenProvider(
      user.refreshToken,
      clientId,
      clientSecret,
      tenantId
    );

    const authProvider = {
      getAccessToken: async () => {
        return tokenProvider.getToken();
      }
    };

    return Client.initWithMiddleware({
      authProvider,
      defaultVersion: "v1.0"
    });
  } catch (error) {
    console.error("Failed to create Graph client:", error);
    return null;
  }
}

// Create a token for Dataverse API access
export async function createDataverseToken(userId: number, dataverseUrl: string): Promise<string | null> {
  try {
    // Mock implementation - replace with actual user retrieval
    // const user = await storage.getUser(userId);
    const user = { refreshToken: process.env.MS_REFRESH_TOKEN || null };
    
    if (!user.refreshToken) {
      console.error("User has no refresh token");
      return null;
    }

    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const tenantId = process.env.AZURE_TENANT_ID;

    if (!clientId || !clientSecret || !tenantId) {
      console.error("Missing Azure AD app credentials");
      return null;
    }

    // Extract the domain from the Dataverse URL
    const dataverseDomain = new URL(dataverseUrl).hostname;
    const scope = `https://${dataverseDomain}/.default`;
    
    const tokenProvider = new RefreshTokenProvider(
      user.refreshToken,
      clientId,
      clientSecret,
      tenantId,
      scope
    );

    return await tokenProvider.getToken();
  } catch (error) {
    console.error("Failed to create Dataverse token:", error);
    return null;
  }
}

// Check if Microsoft auth credentials are available
export function areAzureCredentialsAvailable(): boolean {
  return !!(
    process.env.AZURE_CLIENT_ID &&
    process.env.AZURE_CLIENT_SECRET && 
    process.env.AZURE_TENANT_ID
  );
}

// Helper function to check if SharePoint is configured
export function isSharePointConfigured(): boolean {
  return areAzureCredentialsAvailable();
}

// SharePoint operations
export async function createSharePointFolder(
  client: Client,
  siteId: string,
  driveId: string,
  folderName: string,
  parentFolderId: string = "root"
): Promise<{ id: string; webUrl: string }> {
  try {
    const response = await client
      .api(`/sites/${siteId}/drives/${driveId}/items/${parentFolderId}/children`)
      .post({
        name: folderName,
        folder: {},
        "@microsoft.graph.conflictBehavior": "rename"
      });
    
    return {
      id: response.id,
      webUrl: response.webUrl
    };
  } catch (error) {
    console.error("Error creating SharePoint folder:", error);
    throw error;
  }
}

export async function uploadFileToSharePoint(
  client: Client,
  siteId: string,
  driveId: string,
  folderId: string,
  fileName: string,
  fileContent: Buffer | string,
  contentType: string
): Promise<{ id: string; webUrl: string }> {
  try {
    // For small files (< 4MB), use simple upload
    const response = await client
      .api(`/sites/${siteId}/drives/${driveId}/items/${folderId}:/${fileName}:/content`)
      .put(fileContent);
    
    return {
      id: response.id,
      webUrl: response.webUrl
    };
  } catch (error) {
    console.error("Error uploading file to SharePoint:", error);
    throw error;
  }
}

export async function getSharePointDrives(
  client: Client,
  siteId: string
): Promise<Array<{ id: string; name: string }>> {
  try {
    const response = await client
      .api(`/sites/${siteId}/drives`)
      .get();
    
    return response.value.map((drive: { id: string; name: string }) => ({
      id: drive.id,
      name: drive.name
    }));
  } catch (error) {
    console.error("Error getting SharePoint drives:", error);
    throw error;
  }
}

export async function getSharePointSites(
  client: Client
): Promise<Array<{ id: string; name: string; webUrl: string }>> {
  try {
    // Get the top sites from the organization
    const response = await client
      .api('/sites?search=*')
      .get();
    
    return response.value.map((site: { id: string; displayName: string; webUrl: string }) => ({
      id: site.id,
      name: site.displayName,
      webUrl: site.webUrl
    }));
  } catch (error) {
    console.error("Error getting SharePoint sites:", error);
    throw error;
  }
}
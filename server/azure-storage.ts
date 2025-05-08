import { BlobServiceClient, ContainerClient, BlobUploadCommonResponse } from '@azure/storage-blob';

// Azure Blob Storage configuration
// These values should be stored in environment variables
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'equipment-images';

// Check if Azure connection string is available
const isAzureConfigured = !!connectionString;

// Initialize the BlobServiceClient
let blobServiceClient: BlobServiceClient | null = null;
let containerClient: ContainerClient | null = null;

if (isAzureConfigured) {
  try {
    blobServiceClient = BlobServiceClient.fromConnectionString(connectionString!);
    containerClient = blobServiceClient.getContainerClient(containerName);
    console.log('Azure Blob Storage initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Azure Blob Storage:', error);
  }
}

/**
 * Upload an image to Azure Blob Storage
 * @param imageData Base64 encoded image data (without the prefix)
 * @param equipmentType Type of equipment (e.g., 'camera', 'access_point')
 * @param equipmentId Equipment ID
 * @param projectId Project ID
 * @param filename Optional filename
 * @returns URL of the uploaded blob if successful, null otherwise
 */
export async function uploadImageToAzure(
  imageData: string,
  equipmentType: string,
  equipmentId: number,
  projectId: number,
  filename?: string | null
): Promise<{ url: string; blobName: string } | null> {
  if (!isAzureConfigured || !containerClient) {
    console.warn('Azure Blob Storage not configured. Falling back to database storage.');
    return null;
  }

  try {
    // Create a unique ID for the blob
    const timestamp = new Date().getTime();
    const blobName = `${projectId}/${equipmentType}/${equipmentId}/${timestamp}${filename ? '-' + filename : ''}`;
    
    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Convert base64 to buffer
    const buffer = Buffer.from(imageData, 'base64');
    
    // Set content type
    const contentType = 'image/jpeg'; // Default to JPEG
    
    // Upload data
    const uploadResponse = await blockBlobClient.upload(buffer, buffer.length, {
      blobHTTPHeaders: {
        blobContentType: contentType
      }
    });
    
    if (uploadResponse.requestId) {
      return {
        url: blockBlobClient.url,
        blobName: blobName
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to upload image to Azure Blob Storage:', error);
    return null;
  }
}

/**
 * Delete an image from Azure Blob Storage
 * @param blobName Name of the blob to delete
 * @returns True if deleted successfully, false otherwise
 */
export async function deleteImageFromAzure(blobName: string): Promise<boolean> {
  if (!isAzureConfigured || !containerClient) {
    console.warn('Azure Blob Storage not configured. Cannot delete blob.');
    return false;
  }

  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
    return true;
  } catch (error) {
    console.error('Failed to delete image from Azure Blob Storage:', error);
    return false;
  }
}

/**
 * Generate a Shared Access Signature (SAS) URL for an image
 * @param blobName Name of the blob
 * @param expiryMinutes Number of minutes until the URL expires
 * @returns SAS URL for the blob
 */
export async function generateSasUrl(blobName: string, expiryMinutes = 60): Promise<string | null> {
  if (!isAzureConfigured || !containerClient || !blobServiceClient) {
    return null;
  }

  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    // Generate SAS token
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + expiryMinutes);
    
    // If the SAS token generation is needed, use this:
    // const sasToken = await generateBlobSASToken({...});
    // const sasUrl = `${blockBlobClient.url}?${sasToken}`;
    
    // For simplicity, we'll just return the URL for now
    return blockBlobClient.url;
  } catch (error) {
    console.error('Failed to generate SAS URL:', error);
    return null;
  }
}

export { isAzureConfigured };
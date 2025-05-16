import axios from 'axios';

/**
 * Fetches an image from a URL and returns it as a base64 string
 * @param imageUrl URL of the image to fetch
 * @returns Base64 encoded string with data URI prefix
 */
export async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  try {
    // Fetch the image as arraybuffer
    const response = await axios.get(imageUrl, { 
      responseType: 'arraybuffer' 
    });
    
    // Convert buffer to base64
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    
    // Determine content type based on response headers or default to jpeg
    const contentType = response.headers['content-type'] || 'image/jpeg';
    
    // Return complete data URI
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Error fetching image as base64:', error);
    throw new Error('Failed to fetch image');
  }
}
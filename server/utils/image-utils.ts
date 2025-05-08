import sharp from 'sharp';

/**
 * Compresses and optimizes an image for storage.
 * 
 * @param imageData Base64 encoded image data
 * @param quality JPEG quality (1-100, default 80)
 * @param maxWidth Maximum width to resize to while maintaining aspect ratio (default 1920px)
 * @returns Compressed base64 image data
 */
export async function compressImage(
  imageData: string, 
  quality: number = 80, 
  maxWidth: number = 1920
): Promise<string> {
  try {
    // Extract the base64 data part (remove the data:image/jpeg;base64, prefix)
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Get image metadata to check dimensions
    const metadata = await sharp(buffer).metadata();
    
    // Only resize if the image is wider than maxWidth
    let processedImage = sharp(buffer);
    if (metadata.width && metadata.width > maxWidth) {
      processedImage = processedImage.resize(maxWidth);
    }
    
    // Convert to JPEG with the specified quality
    const compressedBuffer = await processedImage
      .jpeg({ quality })
      .toBuffer();
    
    // Calculate compression ratio for logging
    const originalSize = buffer.length;
    const compressedSize = compressedBuffer.length;
    const compressionRatio = (originalSize / compressedSize).toFixed(2);
    
    console.log(`Image compressed: ${originalSize} -> ${compressedSize} bytes (${compressionRatio}x ratio)`);
    
    // Convert back to base64 with the proper prefix
    return `data:image/jpeg;base64,${compressedBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return the original image if compression fails
    return imageData;
  }
}

/**
 * Creates a smaller thumbnail version of an image
 * 
 * @param imageData Base64 encoded image data
 * @param width Thumbnail width (default 300px)
 * @returns Thumbnail as base64 image data
 */
export async function createThumbnail(
  imageData: string,
  width: number = 300
): Promise<string> {
  try {
    // Extract the base64 data part (remove the data:image/jpeg;base64, prefix)
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Create a thumbnail
    const thumbnailBuffer = await sharp(buffer)
      .resize(width)
      .jpeg({ quality: 70 })
      .toBuffer();
    
    // Convert back to base64
    return `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Thumbnail creation failed:', error);
    // Return null if thumbnail creation fails
    return '';
  }
}
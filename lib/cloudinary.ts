import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload file to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Folder name in Cloudinary
 * @param filename - Optional filename
 * @returns Cloudinary upload result with secure_url
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string = 'hackathon',
  filename?: string
) {
  try {
    const result = await cloudinary.uploader.upload(
      file instanceof Buffer ? `data:image/jpeg;base64,${file.toString('base64')}` : file,
      {
        folder: folder,
        public_id: filename,
        resource_type: 'auto',
        overwrite: true,
      }
    )

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    }
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw new Error('Failed to upload file to Cloudinary')
  }
}

/**
 * Delete file from Cloudinary
 * @param publicId - Public ID of the file
 * @param resourceType - Type of resource (image, video, raw, auto)
 */
export async function deleteFromCloudinary(publicId: string, resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto') {
  try {
    // Try different resource types if auto doesn't work
    const types = resourceType === 'auto' ? ['raw', 'image', 'video'] : [resourceType]

    for (const type of types) {
      try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: type })
        if (result.result === 'ok') {
          console.log(`✅ Deleted from Cloudinary (${type}):`, publicId)
          return result
        }
      } catch (err) {
        // Continue to next type
        console.log(`⚠️ Failed to delete as ${type}, trying next...`)
      }
    }

    console.warn('⚠️ Could not delete from Cloudinary:', publicId)
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    throw new Error('Failed to delete file from Cloudinary')
  }
}

/**
 * Upload multiple files to Cloudinary
 * @param files - Array of file buffers or base64 strings
 * @param folder - Folder name in Cloudinary
 * @returns Array of upload results
 */
export async function uploadMultipleToCloudinary(
  files: (Buffer | string)[],
  folder: string = 'hackathon'
) {
  try {
    const uploadPromises = files.map((file) => uploadToCloudinary(file, folder))
    return await Promise.all(uploadPromises)
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error)
    throw new Error('Failed to upload files to Cloudinary')
  }
}

export default cloudinary


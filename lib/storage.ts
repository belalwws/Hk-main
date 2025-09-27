import { v2 as cloudinary } from 'cloudinary'

// AWS S3 will be loaded dynamically if needed

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadResult {
  success: boolean
  url?: string
  key?: string
  error?: string
}

// AWS S3 functions removed to avoid build errors
// Can be added back when AWS SDK is properly configured

/**
 * Fallback: Save to local filesystem (for development)
 */
export async function saveToLocal(
  file: Buffer,
  filePath: string
): Promise<UploadResult> {
  try {
    const fs = await import('fs/promises')
    const path = await import('path')
    
    // Ensure directory exists
    const dir = path.dirname(filePath)
    await fs.mkdir(dir, { recursive: true })
    
    // Save file
    await fs.writeFile(filePath, file)
    
    const publicPath = filePath.replace(process.cwd() + '/public', '')
    
    return {
      success: true,
      url: publicPath,
      key: path.basename(filePath)
    }
  } catch (error) {
    console.error('❌ Local save failed:', error)
    console.error('❌ Local save error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack',
      type: typeof error,
      constructor: error?.constructor?.name,
      filePath
    })

    let errorMessage = 'Local file save failed'
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    }

    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Upload to Cloudinary
 */
export async function uploadToCloudinary(
  file: Buffer,
  filename: string,
  folder: string = 'certificates'
): Promise<UploadResult> {
  try {
    console.log('☁️ Uploading to Cloudinary:', filename)
    console.log('🔧 Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '✅' : '❌',
      api_key: process.env.CLOUDINARY_API_KEY ? '✅' : '❌',
      api_secret: process.env.CLOUDINARY_API_SECRET ? '✅' : '❌'
    })

    // Ensure Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary credentials not configured')
    }

    // Re-configure Cloudinary to ensure it's set up
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: folder,
          public_id: filename.replace(/\.[^/.]+$/, ''), // Remove extension
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary stream error:', error)
            reject(error)
          } else {
            console.log('✅ Cloudinary stream success:', result?.secure_url)
            resolve(result)
          }
        }
      ).end(file)
    }) as any

    if (!result || !result.secure_url) {
      throw new Error('Cloudinary upload returned no result')
    }

    console.log('✅ Cloudinary upload successful:', result.secure_url)

    return {
      success: true,
      url: result.secure_url,
      key: result.public_id
    }
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error)
    console.error('❌ Cloudinary error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack',
      type: typeof error,
      constructor: error?.constructor?.name
    })

    let errorMessage = 'Cloudinary upload failed'
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message)
    }

    return {
      success: false,
      error: errorMessage
    }
  }
}

/**
 * Smart upload: Try Cloudinary first, then local
 */
export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string,
  folder: string = 'certificates'
): Promise<UploadResult> {
  try {
    console.log('🚀 uploadFile called with:', {
      filename,
      contentType,
      folder,
      bufferSize: file.length,
      hasCloudinaryConfig: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)
    })

    const key = `${folder}/${filename}`

    // Try Cloudinary first (recommended)
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      console.log('☁️ Using Cloudinary storage')
      const result = await uploadToCloudinary(file, filename, folder)
      console.log('☁️ Cloudinary result:', result)
      return result
    }

    // Fallback to local storage
    console.log('💾 Using local storage (development only - files will be lost on Render)')
    const localPath = `${process.cwd()}/public/${key}`
    const result = await saveToLocal(file, localPath)
    console.log('💾 Local storage result:', result)
    return result

  } catch (error) {
    console.error('❌ uploadFile error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    }
  }
}

/**
 * Get public URL for uploaded file
 */
export function getPublicUrl(key: string): string {
  // For Cloudinary URLs, return as-is
  if (key.startsWith('https://res.cloudinary.com/')) {
    return key
  }

  // For local files
  return `/${key}`
}

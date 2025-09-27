import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v2 as cloudinary } from 'cloudinary'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'hackathon-certificates'

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

/**
 * Upload file to S3
 */
export async function uploadToS3(
  file: Buffer,
  key: string,
  contentType: string
): Promise<UploadResult> {
  try {
    console.log('📤 Uploading to S3:', key, 'Type:', contentType)

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      ACL: 'public-read', // Make file publicly accessible
    })

    await s3Client.send(command)

    const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
    console.log('✅ S3 upload successful:', url)

    return {
      success: true,
      url,
      key
    }
  } catch (error) {
    console.error('❌ S3 upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Get signed URL for private files (if needed)
 */
export async function getSignedUrlFromS3(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn })
    return signedUrl
  } catch (error) {
    console.error('❌ Error getting signed URL:', error)
    throw error
  }
}

/**
 * Delete file from S3
 */
export async function deleteFromS3(key: string): Promise<boolean> {
  try {
    console.log('🗑️ Deleting from S3:', key)

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await s3Client.send(command)
    console.log('✅ S3 delete successful:', key)
    return true
  } catch (error) {
    console.error('❌ S3 delete failed:', error)
    return false
  }
}

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
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
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

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: folder,
          public_id: filename.replace(/\.[^/.]+$/, ''), // Remove extension
          overwrite: true,
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(file)
    }) as any

    console.log('✅ Cloudinary upload successful:', result.secure_url)

    return {
      success: true,
      url: result.secure_url,
      key: result.public_id
    }
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Smart upload: Try Cloudinary first, then S3, then local
 */
export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string,
  folder: string = 'certificates'
): Promise<UploadResult> {
  const key = `${folder}/${filename}`

  // Try Cloudinary first (easiest to setup)
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
    console.log('☁️ Using Cloudinary storage')
    return await uploadToCloudinary(file, filename, folder)
  }

  // Try S3 if Cloudinary not available
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('🌐 Using S3 storage')
    return await uploadToS3(file, key, contentType)
  }

  // Fallback to local storage
  console.log('💾 Using local storage (development)')
  const localPath = `${process.cwd()}/public/${key}`
  return await saveToLocal(file, localPath)
}

/**
 * Get public URL for uploaded file
 */
export function getPublicUrl(key: string, isS3: boolean = false): string {
  if (isS3 && process.env.AWS_S3_BUCKET) {
    return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`
  }
  
  // Local URL
  return `/${key}`
}

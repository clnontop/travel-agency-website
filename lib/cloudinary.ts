import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'stream'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface UploadOptions {
  folder?: string
  public_id?: string
  resource_type?: 'image' | 'video' | 'raw' | 'auto'
  transformation?: any[]
  allowed_formats?: string[]
  max_file_size?: number
}

// Upload file from buffer
export async function uploadFile(
  buffer: Buffer,
  options: UploadOptions = {}
): Promise<any> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'trinck',
        public_id: options.public_id,
        resource_type: options.resource_type || 'auto',
        transformation: options.transformation,
        allowed_formats: options.allowed_formats,
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result)
        }
      }
    )

    const readableStream = Readable.from(buffer)
    readableStream.pipe(uploadStream)
  })
}

// Upload file from URL
export async function uploadFromUrl(
  url: string,
  options: UploadOptions = {}
): Promise<any> {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: options.folder || 'trinck',
      public_id: options.public_id,
      resource_type: options.resource_type || 'auto',
      transformation: options.transformation,
      allowed_formats: options.allowed_formats,
    })
    return result
  } catch (error) {
    console.error('Error uploading from URL:', error)
    throw error
  }
}

// Delete file
export async function deleteFile(publicId: string): Promise<any> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

// Get optimized URL
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    crop?: string
    quality?: number | 'auto'
    format?: string
  } = {}
): string {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width: options.width,
        height: options.height,
        crop: options.crop || 'fill',
        quality: options.quality || 'auto',
        format: options.format || 'auto',
      },
    ],
  })
}

// Upload profile image with optimization
export async function uploadProfileImage(
  buffer: Buffer,
  userId: string
): Promise<{ url: string; publicId: string }> {
  const result = await uploadFile(buffer, {
    folder: 'trinck/profiles',
    public_id: `user_${userId}_${Date.now()}`,
    resource_type: 'image',
    transformation: [
      { width: 500, height: 500, crop: 'fill', gravity: 'face' },
      { quality: 'auto' },
      { format: 'webp' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
  }
}

// Upload document
export async function uploadDocument(
  buffer: Buffer,
  documentType: string,
  userId: string
): Promise<{ url: string; publicId: string }> {
  const result = await uploadFile(buffer, {
    folder: `trinck/documents/${documentType}`,
    public_id: `${documentType}_${userId}_${Date.now()}`,
    resource_type: 'auto',
    allowed_formats: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'],
    max_file_size: 10 * 1024 * 1024, // 10MB
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
  }
}

// Upload vehicle image
export async function uploadVehicleImage(
  buffer: Buffer,
  vehicleId: string
): Promise<{ url: string; publicId: string }> {
  const result = await uploadFile(buffer, {
    folder: 'trinck/vehicles',
    public_id: `vehicle_${vehicleId}_${Date.now()}`,
    resource_type: 'image',
    transformation: [
      { width: 1200, height: 800, crop: 'fill' },
      { quality: 'auto:good' },
      { format: 'webp' },
    ],
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
  }
}

// Generate signature for direct browser upload
export function generateUploadSignature(params: any): string {
  const timestamp = Math.round(new Date().getTime() / 1000)
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      ...params,
    },
    process.env.CLOUDINARY_API_SECRET!
  )

  return signature
}

// Get upload preset for direct browser uploads
export function getUploadPreset(type: 'profile' | 'document' | 'vehicle') {
  const presets = {
    profile: {
      folder: 'trinck/profiles',
      transformation: [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
      ],
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
    document: {
      folder: 'trinck/documents',
      allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
      max_file_size: 10 * 1024 * 1024,
    },
    vehicle: {
      folder: 'trinck/vehicles',
      transformation: [
        { width: 1200, height: 800, crop: 'fill' },
        { quality: 'auto:good' },
      ],
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    },
  }

  return presets[type]
}

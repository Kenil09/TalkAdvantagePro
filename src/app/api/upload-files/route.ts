import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const fileUploadSchema = z.object({
  filename: z.string(),
  path: z.string().default(''),
  contentType: z.string().default('audio/mpeg'),
  filesize: z.number().optional(),
})

export async function POST(request: Request) {
  try {
    const bucketName = process.env.S3_BUCKET_NAME
    const body = await request.json()
    const validation = fileUploadSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request format', details: validation.error.format() },
        { status: 400 },
      )
    }
    const { filename, path: folder, contentType, filesize } = validation.data
    const key = `${folder}/${filename}`

    if (!bucketName) {
      return NextResponse.json(
        { error: 'S3_BUCKET_NAME not set' },
        { status: 500 },
      )
    }

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    })

    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 })

    return NextResponse.json({ url, path: key, filesize })
  } catch (error) {
    console.error('Error handling upload:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

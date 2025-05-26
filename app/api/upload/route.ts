import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import sharp from 'sharp';
import { authOptions } from '@/lib/auth';

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif'
];

const IMAGE_CONFIGS = {
  thumbnail: { width: 400, height: 300 },
  display: { width: 800, height: 600 }
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.role || session.user.role !== 'admin') {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: JPEG, PNG, WebP, GIF, AVIF' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const timestamp = Date.now();
    const originalFilename = file.name.replace(/[^a-zA-Z0-9.]/g, '');
    const extension = originalFilename.split('.').pop()?.toLowerCase() || 'jpg';
    const baseFilename = `${timestamp}-${originalFilename.split('.')[0]}`;
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process and optimize images
    const sharpInstance = sharp(buffer);
    
    // Create display version
    const displayFilename = `${baseFilename}-display.${extension}`;
    const displayPath = join(process.cwd(), 'public/uploads', displayFilename);
    await sharpInstance
      .resize(IMAGE_CONFIGS.display.width, IMAGE_CONFIGS.display.height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toFile(displayPath);

    // Create thumbnail version
    const thumbnailFilename = `${baseFilename}-thumb.${extension}`;
    const thumbnailPath = join(process.cwd(), 'public/uploads', thumbnailFilename);
    await sharpInstance
      .resize(IMAGE_CONFIGS.thumbnail.width, IMAGE_CONFIGS.thumbnail.height, {
        fit: 'cover'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);

    // Return the public URLs
    return NextResponse.json({
      url: `/uploads/${displayFilename}`,
      thumbnail: `/uploads/${thumbnailFilename}`
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 
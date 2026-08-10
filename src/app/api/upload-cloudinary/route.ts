import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File | null;
    const folderParam = (data.get('folder') as string | null) || 'bdc_recruitment_2026';

    if (!file) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy file.' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type) && !file.name.match(/\.(pdf|png|jpg|jpeg|webp|doc|docx)$/i)) {
      return NextResponse.json(
        { success: false, message: 'Chỉ chấp nhận file PDF, PNG, JPG, JPEG, DOC, DOCX.' },
        { status: 400 }
      );
    }

    // Max 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'File vượt quá dung lượng tối đa 10MB.' }, { status: 400 });
    }

    // Convert to base64 data URI
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = file.type || 'application/octet-stream';
    const dataUri = `data:${mimeType};base64,${base64}`;

    // Determine resource_type for Cloudinary
    const isImage = file.type.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';

    const sanitizeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: folderParam,
      resource_type: resourceType,
      public_id: `${Date.now()}_${sanitizeName}`,
      use_filename: false,
      overwrite: false,
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      filename: file.name,
      size: file.size,
      format: result.format || file.name.split('.').pop(),
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải lên file lên Cloudinary. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}


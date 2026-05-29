import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy file.' }, { status: 400 });
    }

    // Only allow PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ success: false, message: 'Chỉ chấp nhận file PDF.' }, { status: 400 });
    }

    // Max 5 MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'File vượt quá 5MB.' }, { status: 400 });
    }

    // Convert to base64 data URI
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:application/pdf;base64,${base64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'hpc_summer_school_2026_cv',
      resource_type: 'raw',
      public_id: `cv_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
      use_filename: false,
      overwrite: false,
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      filename: file.name,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tải lên file. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

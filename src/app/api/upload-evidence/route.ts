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

    // Allowed file types: PDF, PNG, JPG, JPEG
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, message: 'Chỉ chấp nhận file PDF hoặc hình ảnh (PNG, JPG, JPEG).' }, { status: 400 });
    }

    // Max 10 MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: 'File vượt quá dung lượng tối đa 10MB.' }, { status: 400 });
    }

    // Convert to base64 data URI
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary using resource_type: auto to handle both images and raw/pdf documents
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'mt23khm3_hk252_evidence',
      resource_type: 'auto',
      public_id: `evidence_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`,
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
      { success: false, message: 'Lỗi khi tải lên file minh chứng. Vui lòng thử lại.' },
      { status: 500 }
    );
  }
}

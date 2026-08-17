import { useState } from 'react';
import { lmsApiClient } from '@/services/lmsApiClient';

export const useMarkdownImage = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map MIME types to file extensions
  const getMimeTypeExtension = (mimeType: string): string => {
    const mimeToExtension: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'image/bmp': '.bmp',
    };
    return mimeToExtension[mimeType] || '.png'; // Default to .png if unknown
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      setError(null);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Vui lòng chọn file ảnh');
      }

      // Validate file size (e.g., max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Ảnh không được vượt quá 10MB');
      }

      // Handle clipboard images that might not have proper filenames
      let fileToUpload = file;
      if (
        file.name === 'image.png' || 
        file.name === 'clipboard' || 
        !file.name.includes('.') ||
        !file.type
      ) {
        // Generate a proper filename with extension based on MIME type
        const extension = getMimeTypeExtension(file.type);
        const timestamp = Date.now();
        const newFilename = `image_${timestamp}${extension}`;
        fileToUpload = new File([file], newFilename, { type: file.type });
      }

      // Create FormData
      const formData = new FormData();
      formData.append('type', 'image');
      formData.append('file', fileToUpload);

      // Upload using lmsApiClient (wraps /lmsapiv1)
      const response = await lmsApiClient.post<{ data: { file_path: string } }>(
        '/files/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (!response.data?.data?.file_path) {
        throw new Error('Upload thất bại, không nhận được đường dẫn file');
      }

      // The backend returns a file_path like "uploads/..."
      // We assume it can be accessed via /files/download or similar, 
      // but usually the app serves it through the lmsapi proxy.
      // According to the hint: /files/${data.data.file_path}
      return `/files/${response.data.data.file_path}`;
    } catch (err: any) {
      console.error('Markdown Image Upload Error:', err);
      
      // Parse error message from backend response
      let message = 'Lỗi upload ảnh';
      
      if (err.response?.data?.error) {
        message = err.response.data.error;
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.data?.detail) {
        message = err.response.data.detail;
      } else if (err.message) {
        message = err.message;
      }
      
      // Provide user-friendly error messages
      if (message.includes('invalid_file_type')) {
        message = 'Định dạng ảnh không được hỗ trợ. Vui lòng chọn: JPG, PNG, GIF, WebP, BMP, hoặc SVG';
      } else if (message.includes('File type')) {
        // Backend sends detailed message
        message = message;
      } else if (err.response?.status === 413) {
        message = 'File quá lớn (tối đa 10MB)';
      } else if (err.response?.status === 401) {
        message = 'Bạn cần đăng nhập để upload ảnh';
      }
      
      setError(message);
      throw new Error(message);
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading, error };
};

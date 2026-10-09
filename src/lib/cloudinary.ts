export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format?: string;
  bytes?: number;
  original_filename?: string;
  created_at?: string;
}

export async function uploadResumeToCloudinary(file: File): Promise<CloudinaryUploadResponse> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'hg';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'hireai_resume';

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary configuration is missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  // Cloudinary unsigned upload endpoint
  // 'auto' automatically detects PDF, DOCX, and text document MIME types
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // If 'auto' failed for docx, try 'raw'
      if (response.status === 400) {
        const rawUrl = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
        const rawResponse = await fetch(rawUrl, {
          method: 'POST',
          body: formData,
        });
        if (rawResponse.ok) {
          return await rawResponse.json();
        }
      }

      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `Cloudinary upload failed (status ${response.status})`;
      throw new Error(errorMessage);
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data;
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    throw new Error(error.message || 'Failed to upload resume to Cloudinary.');
  }
}

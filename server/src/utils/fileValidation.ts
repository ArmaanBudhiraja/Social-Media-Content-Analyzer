import path from 'path';

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/bmp',
  'image/tiff',
];

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
  fileType?: 'pdf' | 'image';
}

export function validateUploadedFile(
  file: Express.Multer.File | undefined
): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file was uploaded.' };
  }

  if (!file.buffer || file.buffer.length === 0) {
    return { valid: false, error: 'The uploaded file is empty.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size exceeds the 15MB limit (received ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
    };
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();

  const isPdf =
    mimeType === 'application/pdf' || ext === '.pdf';
  const isImage =
    mimeType.startsWith('image/') ||
    ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'].includes(ext);

  if (isPdf) {
    return { valid: true, fileType: 'pdf' };
  }

  if (isImage) {
    return { valid: true, fileType: 'image' };
  }

  return {
    valid: false,
    error: `Unsupported file format '${file.mimetype || ext}'. Please upload a PDF or image (PNG, JPG, WEBP).`,
  };
}

export function sanitizeFilename(filename: string): string {
  // Strip path traversal and weird control characters
  const basename = path.basename(filename);
  return basename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

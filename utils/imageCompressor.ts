
import Compressor from 'compressorjs';

export async function compressImage(
  file: File, 
  options: {
    quality?: number;
    maxWidth?: number;
    maxHeight?: number;
    convertSize?: number;
  } = {}
): Promise<{ file: File; originalSize: number; compressedSize: number }> {
  
  const defaultOptions = {
    quality: 0.8,
    maxWidth: 1200,
    maxHeight: 1200,
    convertSize: 5000000, // Convert to JPEG if >5MB
    mimeType: 'image/jpeg',
  };

  return new Promise((resolve, reject) => {
    new Compressor(file, {
      ...defaultOptions,
      ...options,
      
      success(result) {
        // Ensure a predictable filename extension
        const originalName = file.name.replace(/\.[^/.]+$/, '');
        const compressedFile = new File(
          [result],
          `compressed_${originalName}.jpg`,
          { type: 'image/jpeg' }
        );
        
        resolve({
          file: compressedFile,
          originalSize: file.size,
          compressedSize: compressedFile.size,
        });
      },
      
      error(err) {
        console.error('Image compression error:', err.message);
        reject(err);
      }
    });
  });
}

export function calculateCompressionRatio(original: number, compressed: number): number {
  if (original === 0) return 0;
  return parseFloat(((1 - compressed / original) * 100).toFixed(1));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

import React, { useState, useRef } from 'react';
import { RefreshCw, Send, ImagePlus, CheckCircle } from 'lucide-react';
import { compressImage, calculateCompressionRatio, formatBytes } from '../../utils/imageCompressor';
import { Spinner } from '../common/Spinner';
import { Confetti } from '../common/Confetti';
import { playSuccessSound, playSpecialSuccessSound } from '../../utils/sounds';

interface PhotoUploadProps {
  onUploadComplete: (photoFile: File, compressedSize: number) => void;
  compressionQuality: number;
  compressionMaxWidth: number;
  isSpecial: boolean;
}

type UploadState = 'idle' | 'previewing' | 'compressing' | 'uploading' | 'verifying' | 'success';

const CompressionStats: React.FC<{ original: number; compressed: number; ratio: number }> = ({ original, compressed, ratio }) => (
    <div className="mt-2 text-xs text-center text-slate-500 bg-slate-100 p-2 rounded-lg">
        <p>Original: <strong>{formatBytes(original)}</strong> | Compressed: <strong>{formatBytes(compressed)}</strong></p>
        <p>Space Saved: <strong className="text-green-600">{ratio}%</strong></p>
    </div>
);


export default function PhotoUpload({ onUploadComplete, compressionQuality, compressionMaxWidth, isSpecial }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<{ originalSize: number; compressedSize: number; ratio: number } | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [showConfetti, setShowConfetti] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (preview) URL.revokeObjectURL(preview);
    
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setUploadState('previewing');
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setUploadState('compressing');
    try {
      const { file: compressedFile, originalSize, compressedSize } = await compressImage(selectedFile, {
        quality: compressionQuality,
        maxWidth: compressionMaxWidth,
      });

      const ratio = calculateCompressionRatio(originalSize, compressedSize);
      setCompressionInfo({ originalSize, compressedSize, ratio });
      setUploadState('uploading');
      
      await onUploadComplete(compressedFile, compressedSize);
      
      setUploadState('verifying'); // Instant feedback state
      setTimeout(() => {
        setUploadState('success');
        if (isSpecial) playSpecialSuccessSound(); else playSuccessSound();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }, 600); // Short delay before celebration

    } catch (err) {
      alert('Failed to process photo. Please try another one.');
      console.error(err);
      reset();
    }
  };

  const reset = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setSelectedFile(null);
    setCompressionInfo(null);
    setUploadState('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const triggerFileSelect = () => { fileInputRef.current?.click(); };

  if (uploadState === 'success') {
    return (
        <div className="text-center p-8 bg-green-50 border-2 border-dashed border-green-300 rounded-lg relative overflow-hidden">
            {showConfetti && <Confetti />}
            <h3 className="text-2xl font-semibold text-green-800">Done!</h3>
            <p className="mt-1 text-slate-600">Your photo has been submitted. Waiting for the next challenge...</p>
        </div>
    );
  }

  if (uploadState === 'previewing' || uploadState === 'compressing' || uploadState === 'uploading' || uploadState === 'verifying') {
      return (
          <div className="w-full p-4 bg-white rounded-lg shadow-inner">
            <div className="relative">
              <img src={preview!} alt="Preview" className={`w-full h-auto object-contain rounded-lg max-h-80 transition-opacity duration-300 ${uploadState === 'verifying' ? 'opacity-50' : 'opacity-100'}`} />
              {uploadState === 'verifying' && (
                <div className="absolute inset-0 flex items-center justify-center">
                   <CheckCircle className="w-24 h-24 text-green-500 animate-pulse" />
                </div>
              )}
            </div>
            {compressionInfo && <CompressionStats original={compressionInfo.originalSize} compressed={compressionInfo.compressedSize} ratio={compressionInfo.ratio} />}
            
            <div className="mt-4">
                {uploadState === 'previewing' ? (
                    <div className="flex gap-2">
                        <button onClick={reset} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition">
                            <RefreshCw className="w-4 h-4"/> Choose Another
                        </button>
                        <button onClick={handleSubmit} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition">
                            <Send className="w-4 h-4"/> Submit Photo
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-center h-[54px]">
                        <Spinner />
                        <p className="text-slate-600 font-medium">
                           {uploadState === 'compressing' ? 'Optimizing photo...' : 'Submitting...'}
                        </p>
                    </div>
                )}
            </div>
          </div>
      )
  }

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*;capture=camera"
        className="hidden"
      />
      <button
        onClick={triggerFileSelect}
        className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-lg text-center hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
      >
        <ImagePlus className="h-12 w-12 text-slate-400" />
        <span className="mt-2 block text-lg font-semibold text-slate-800">Take or Upload Photo</span>
        <span className="mt-1 block text-sm text-slate-500">Tap here to open your camera</span>
      </button>
    </>
  );
}
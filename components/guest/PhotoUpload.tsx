import React, { useState, useRef, useEffect } from 'react';
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
    <div className="text-[10px] text-center text-slate-400 mt-1">
        <span>Orig: {formatBytes(original)} | Opt: {formatBytes(compressed)} ({ratio}%)</span>
    </div>
);

export default function PhotoUpload({ onUploadComplete, compressionQuality, compressionMaxWidth, isSpecial }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressionInfo, setCompressionInfo] = useState<{ originalSize: number; compressedSize: number; ratio: number } | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [showConfetti, setShowConfetti] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on preview to ensure buttons are seen (fallback for sticky)
  useEffect(() => {
    if (uploadState === 'previewing') {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, [uploadState]);

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
      
      setUploadState('verifying'); 
      setTimeout(() => {
        setUploadState('success');
        if (isSpecial) playSpecialSuccessSound(); else playSuccessSound();
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }, 600);

    } catch (err) {
      alert('Error al procesar la foto. Intenta con otra.');
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
            <h3 className="text-2xl font-semibold text-green-800">¡Listo!</h3>
            <p className="mt-1 text-slate-600">Foto enviada. Esperando el siguiente reto...</p>
        </div>
    );
  }

  if (uploadState === 'previewing' || uploadState === 'compressing' || uploadState === 'uploading' || uploadState === 'verifying') {
      return (
          <div className="w-full bg-white rounded-lg shadow-inner overflow-hidden flex flex-col h-full relative">
            {/* Image Container - Constrained Height */}
            <div className="relative w-full bg-black flex items-center justify-center max-h-[55vh]">
              <img 
                src={preview!} 
                alt="Preview" 
                className={`w-full h-auto max-h-[55vh] object-contain transition-opacity duration-300 ${uploadState === 'verifying' ? 'opacity-50' : 'opacity-100'}`} 
              />
              {uploadState === 'verifying' && (
                <div className="absolute inset-0 flex items-center justify-center">
                   <CheckCircle className="w-24 h-24 text-green-500 animate-pulse" />
                </div>
              )}
            </div>
            
            {/* Sticky/Fixed Bottom Action Bar */}
            <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                {compressionInfo && <CompressionStats original={compressionInfo.originalSize} compressed={compressionInfo.compressedSize} ratio={compressionInfo.ratio} />}
                
                {uploadState === 'previewing' ? (
                    <div className="flex gap-3 mt-2">
                        <button 
                            onClick={reset} 
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-4 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition active:scale-95"
                        >
                            <RefreshCw className="w-5 h-5"/> Cambiar
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            className="flex-[2] flex items-center justify-center gap-2 px-4 py-4 text-base font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 active:scale-95 animate-pulse-slow"
                        >
                            <Send className="w-5 h-5"/> ENVIAR FOTO
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-center py-2">
                        <Spinner />
                        <p className="text-slate-600 font-medium animate-pulse">
                           {uploadState === 'compressing' ? 'Optimizando imagen...' : 'Subiendo a la nube...'}
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
        className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-lg text-center hover:border-indigo-500 hover:bg-indigo-50 transition-colors bg-slate-50 active:bg-slate-200"
      >
        <div className="bg-white p-4 rounded-full shadow-sm mb-3">
            <ImagePlus className="h-10 w-10 text-indigo-500" />
        </div>
        <span className="block text-xl font-bold text-slate-800">Tomar Foto</span>
        <span className="mt-1 block text-sm text-slate-500">Toca aquí para abrir la cámara</span>
      </button>
    </>
  );
}
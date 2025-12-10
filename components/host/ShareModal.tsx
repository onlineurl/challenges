import React, { useState, useRef, useCallback } from 'react';
import { X, Copy, Check, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  joinCode: string;
}

export default function ShareModal({ isOpen, onClose, joinCode }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);
  
  // Robust URL construction
  const joinUrl = `${window.location.protocol}//${window.location.host}/?code=${joinCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const downloadQRCode = useCallback(() => {
    if (!qrRef.current) return;
    
    const svgElement = qrRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
        const padding = 20;
        canvas.width = img.width + padding * 2;
        canvas.height = img.height + padding * 2;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(img, padding, padding);
        
        const pngFile = canvas.toDataURL('image/png');
        
        const downloadLink = document.createElement('a');
        downloadLink.download = `ATR-Party-${joinCode}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;

  }, [joinCode]);


  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1 rounded-full text-slate-500 hover:bg-slate-200"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 id="modal-title" className="text-2xl font-bold text-center text-slate-800 mb-4">Compartir Evento</h2>
        
        <div className="flex flex-col items-center">
            <div ref={qrRef} className="p-4 bg-white border rounded-lg shadow-inner">
                <QRCodeSVG value={joinUrl} size={192} includeMargin={true} level="M" />
            </div>
            <p className="mt-4 font-mono text-3xl font-bold tracking-widest text-slate-700">{joinCode}</p>
        </div>

        <div className="mt-6 space-y-3">
            <div>
                <label htmlFor="join-link" className="text-sm font-medium text-slate-600">Enlace del Evento</label>
                <div className="mt-1 flex rounded-md shadow-sm">
                    <input type="text" id="join-link" value={joinUrl} readOnly className="block w-full rounded-none rounded-l-md border-slate-300 bg-slate-50 text-slate-700 sm:text-sm"/>
                    <button
                        onClick={copyToClipboard}
                        className="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    >
                       {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-slate-500" />}
                    </button>
                </div>
            </div>

            <button
                onClick={downloadQRCode}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-md font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition"
            >
                <Download className="w-5 h-5" />
                Descargar QR
            </button>
        </div>
      </div>
    </div>
  );
}
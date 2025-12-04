import React, { useState, useEffect, useCallback } from 'react';
import { useDataService } from '../../hooks/useDataService';
import { ArrowLeft, User, Target, X, Trash2 } from 'lucide-react';
import type { Event, CompletedChallenge } from '../../types';
import { Spinner } from '../common/Spinner';

interface PhotoModalProps { 
    photo: CompletedChallenge; 
    onClose: () => void;
    onReject: (submissionId: string) => void;
}

const PhotoModal: React.FC<PhotoModalProps> = ({ photo, onClose, onReject }) => {
    const handleReject = () => {
        if (window.confirm(`Are you sure you want to reject this submission from ${photo.participant_name}? This will delete the photo and deduct their points.`)) {
            onReject(photo.id);
        }
    }
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute -top-3 -right-3 p-2 bg-white rounded-full text-slate-600 hover:text-slate-900 shadow-lg" aria-label="Close image viewer"><X className="w-6 h-6" /></button>
                <img src={photo.media_url} alt={`Submission for ${photo.challenge_title}`} className="w-full h-auto object-contain rounded-t-lg max-h-[70vh]" />
                <div className="p-4 bg-slate-50 rounded-b-lg flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 text-slate-700"><User className="w-4 h-4"/> <p className="font-semibold">{photo.participant_name}</p></div>
                        <div className="flex items-center gap-2 mt-1 text-slate-600"><Target className="w-4 h-4"/> <p>Challenge: <span className="font-medium">{photo.challenge_title}</span></p></div>
                    </div>
                    <button onClick={handleReject} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition">
                        <Trash2 className="w-4 h-4" /> Reject
                    </button>
                </div>
            </div>
        </div>
    );
}

// FIX: Define PhotoGalleryProps interface for the component.
interface PhotoGalleryProps {
  eventId: string;
  onBack: () => void;
}

export default function PhotoGallery({ eventId, onBack }: PhotoGalleryProps) {
  const dataService = useDataService();
  const [event, setEvent] = useState<Event | null>(null);
  const [photos, setPhotos] = useState<CompletedChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<CompletedChallenge | null>(null);
  
  const fetchData = useCallback(async () => {
    const [eventData, photosData] = await Promise.all([
        dataService.getEvent(eventId),
        dataService.getCompletedForEvent(eventId)
    ]);
    setEvent(eventData);
    setPhotos(photosData.sort((a,b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()));
    setIsLoading(false);
  }, [eventId, dataService]);

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  const handleRejectSubmission = async (submissionId: string) => {
    await dataService.deleteChallengeSubmission(submissionId);
    setSelectedPhoto(null);
    fetchData(); // Refresh the gallery
  }

  if (isLoading) {
      return <div className="p-6 text-center flex justify-center"><Spinner size="lg"/></div>
  }
  
  if (!event) {
    return <div className="p-6 text-center"><h2 className="text-xl font-semibold text-red-600">Event not found!</h2></div>;
  }

  return (
    <>
      {selectedPhoto && <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} onReject={handleRejectSubmission} />}
      <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-200 transition"><ArrowLeft className="w-6 h-6 text-slate-700" /></button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Photo Gallery</h1>
            <p className="text-slate-500 mt-1">Submissions for "{event.title}"</p>
          </div>
        </div>
        
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {photos.map(photo => (
              <div key={photo.id} className="group relative cursor-pointer overflow-hidden rounded-lg shadow-md" onClick={() => setSelectedPhoto(photo)}>
                <img src={photo.media_url} alt={`Challenge submission by ${photo.participant_name}`} className="w-full h-full object-cover aspect-square transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 p-3 text-white">
                        <p className="font-bold text-sm truncate">{photo.participant_name}</p>
                        <p className="text-xs truncate">{photo.challenge_title}</p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
           <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-lg bg-white">
              <h3 className="text-xl font-semibold text-slate-700">No photos yet!</h3>
              <p className="text-slate-500 mt-2">As soon as guests complete challenges, their photos will appear here.</p>
            </div>
        )}
      </div>
    </>
  );
}
import React, { useState } from 'react';
import { Play, Image as ImageIcon } from 'lucide-react';
import { Media } from '../types';

interface VideoPlayerToggleProps {
  media: Media;
  title: string;
  autoPlayTrigger?: boolean;
}

export const VideoPlayerToggle: React.FC<VideoPlayerToggleProps> = ({ media, title, autoPlayTrigger = false }) => {
  const [showVideo, setShowVideo] = useState(false);

  React.useEffect(() => {
    if (autoPlayTrigger) {
      setShowVideo(true);
    }
  }, [autoPlayTrigger]);

  return (
    <div className="relative w-full aspect-video bg-stone-100 rounded-2xl overflow-hidden shadow-inner group">
      {showVideo ? (
        <iframe
          src={media.videoEmbedUrl}
          title={title}
          className="w-full h-full object-cover"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <img
          src={media.thumbnailUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      )}

      {/* Control Toggle */}
      <button
        onClick={() => setShowVideo(!showVideo)}
        className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all text-sage-700"
        aria-label={showVideo ? "Ver Imagem" : "Ver Vídeo"}
      >
        {showVideo ? <ImageIcon size={20} /> : <Play size={20} fill="currentColor" />}
      </button>

      {!showVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-black/10 p-4 rounded-full backdrop-blur-[2px]">
            <Play size={32} className="text-white opacity-80" fill="currentColor" />
          </div>
        </div>
      )}
    </div>
  );
};

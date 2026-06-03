"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Extracts the 11-character YouTube video ID from a URL or returns the string if it's already an ID.
 */
function getYouTubeId(url) {
  if (!url) return null;
  const cleaned = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleaned)) return cleaned;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = cleaned.match(regExp);
  return (match && match[2] && match[2].length === 11) ? match[2] : null;
}

export default function LiteYouTube({ videoUrl, title }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoId = getYouTubeId(videoUrl);

  if (!videoId) return null;

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  // Embed with privacy-enhanced mode, modestbranding, rel=0, and iv_load_policy=3
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&controls=1`;

  if (isPlaying) {
    return (
      <div className="w-full aspect-video relative rounded-2xl overflow-hidden border border-borderCustom shadow-2xl bg-black">
        <iframe
          src={embedUrl}
          title={title || "YouTube Video Player"}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          frameBorder="0"
        />
      </div>
    );
  }

  return (
    <div className="w-full mb-10">
      <div className="text-xs font-semibold text-textMuted uppercase tracking-wider mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        Watch Related Gameplay & Trailer
      </div>
      <button
        onClick={() => setIsPlaying(true)}
        className="group relative w-full aspect-video rounded-2xl overflow-hidden border border-borderCustom shadow-xl bg-zinc-900 block text-left focus:outline-none focus:ring-2 focus:ring-neonBlue/50 transition-all duration-300"
        aria-label={`Play video: ${title || "Gameplay Trailer"}`}
      >
        {/* Thumbnail Image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={title || "Video Thumbnail"}
          className="w-full h-full object-cover opacity-80 group-hover:opacity-70 group-hover:scale-[1.02] transition-all duration-500"
          loading="lazy"
        />

        {/* Ambient Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 group-hover:from-black/90 group-hover:via-black/40 transition-colors duration-300" />

        {/* Action HUD / Branding Watermark removal replacement */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
          <span className="text-xs font-bold px-2.5 py-1 rounded bg-black/60 text-white backdrop-blur border border-white/10 uppercase tracking-widest">
            HD Stream
          </span>
        </div>

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex flex-col justify-center items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-neonBlue/20 group-hover:border-neonBlue/50 group-hover:text-neonBlue">
            <Play className="w-8 h-8 md:w-10 md:h-10 fill-current ml-1" />
          </div>
          <span className="text-xs md:text-sm font-semibold text-white/90 group-hover:text-neonBlue tracking-wider transition-colors duration-200 text-center px-4 max-w-md line-clamp-1">
            Click to Play Video
          </span>
        </div>

        {/* Bottom Title Bar */}
        <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
          <p className="text-xs md:text-sm font-display font-medium text-white/80 line-clamp-1 group-hover:text-white transition-colors duration-200">
            {title}
          </p>
        </div>
      </button>
    </div>
  );
}

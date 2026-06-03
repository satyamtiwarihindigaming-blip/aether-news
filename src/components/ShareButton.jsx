"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

export default function ShareButton({ title }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: title || "AetherNews Article",
      text: `Check out this trending story on AetherNews: ${title}`,
      url: window.location.href,
    };

    // Try native sharing (mobile browsers support this natively)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        console.log("Native share cancelled or failed, falling back to clipboard.");
      }
    }

    // Fallback: Copy to clipboard
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 bg-primary-glow text-background font-bold px-6 py-3 rounded-xl shadow-lg shadow-neonBlue/10 hover:scale-[1.02] hover:shadow-neonBlue/30 hover:shadow-lg transition-all duration-300"
      >
        {copied ? (
          <>
            <Check className="w-4.5 h-4.5" />
            Link Copied!
          </>
        ) : (
          <>
            <Share2 className="w-4.5 h-4.5" />
            Share This Story
          </>
        )}
      </button>

      {/* Sleek Tooltip indicator */}
      {copied && (
        <span className="absolute left-1/2 -translate-x-1/2 -top-10 bg-zinc-900 border border-white/10 text-textPrimary text-xs px-2.5 py-1 rounded-md shadow-lg animate-bounce">
          Copied to clipboard
        </span>
      )}
    </div>
  );
}

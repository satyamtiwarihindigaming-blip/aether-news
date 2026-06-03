"use client";
import { useState } from "react";

export default function BilingualContent({ contentEn, contentHi, titleEn, titleHi }) {
  const [lang, setLang] = useState("en");
  const hasHindi = contentHi && contentHi.trim().length > 10;

  const activeContent = lang === "hi" && hasHindi ? contentHi : contentEn;
  const paragraphs = (activeContent || "").split("\n\n").filter(Boolean);

  return (
    <div>
      {/* Language Toggle */}
      {hasHindi && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-textMuted font-semibold uppercase tracking-wider">Read in:</span>
          <button
            onClick={() => setLang("en")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
              lang === "en"
                ? "bg-primary-glow text-background border-transparent"
                : "border-borderCustom text-textSecondary hover:border-neonBlue hover:text-textPrimary"
            }`}
          >
            🇬🇧 English
          </button>
          <button
            onClick={() => setLang("hi")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
              lang === "hi"
                ? "bg-primary-glow text-background border-transparent"
                : "border-borderCustom text-textSecondary hover:border-neonBlue hover:text-textPrimary"
            }`}
          >
            🇮🇳 हिंदी
          </button>
        </div>
      )}

      {/* Title in selected language */}
      {lang === "hi" && titleHi && (
        <p className="text-sm text-textMuted mb-4 italic border-l-2 border-neonBlue pl-3">
          {titleHi}
        </p>
      )}

      {/* Article body */}
      <div className="text-textSecondary text-base md:text-lg leading-relaxed font-light space-y-6">
        {paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}

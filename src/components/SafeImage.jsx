"use client";

import { useState } from "react";

export default function SafeImage({ src, alt, className, fallbackSrc, loading = "lazy" }) {
  const defaultFallback = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80";
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc || defaultFallback);

  const handleError = () => {
    setImgSrc(fallbackSrc || defaultFallback);
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
    />
  );
}

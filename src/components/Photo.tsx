"use client";

import { useState } from "react";
import { useLocale } from "../lib/locale";

type PhotoProps = {
  src: string;
  alt: string;
  className?: string;
  /** Above-the-fold images skip lazy loading. */
  priority?: boolean;
};

function webpSrc(src: string) {
  if (!/^\/(images|brand)\//.test(src)) return null;
  if (!/\.(jpe?g|png)$/i.test(src)) return null;
  return src.replace(/\.(jpe?g|png)$/i, ".webp");
}

export function Photo({ src, alt, className, priority = false }: PhotoProps) {
  const { t } = useLocale();
  const [failed, setFailed] = useState(false);
  const webp = webpSrc(src);

  if (failed || !src) {
    return (
      <span
        role="img"
        aria-label={alt || t.imageUnavailable}
        className={`block min-h-32 w-full bg-[#e6d8be] ${className ?? ""}`}
      />
    );
  }

  return (
    <picture className="contents">
      {webp && <source srcSet={webp} type="image/webp" />}
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        onError={() => setFailed(true)}
      />
    </picture>
  );
}

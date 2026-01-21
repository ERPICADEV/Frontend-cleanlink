import React from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

/**
 * OptimizedImage
 * - lazy loads
 * - async decoding
 * - serves WebP when available (same URL pattern with ?format=webp if supported by CDN)
 * - drops in without changing layout/behavior; caller controls sizing via props/className
 */
export const OptimizedImage: React.FC<Props> = ({
  src,
  alt,
  width,
  height,
  ...rest
}) => {
  // Simple WebP variant if CDN supports query params; otherwise falls back to src.
  const webp = src.includes("?") ? `${src}&format=webp` : `${src}?format=webp`;

  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img
        loading="lazy"
        decoding="async"
        src={src}
        alt={alt}
        width={width}
        height={height}
        {...rest}
      />
    </picture>
  );
};

export default OptimizedImage;


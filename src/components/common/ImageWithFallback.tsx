import React, { useState } from 'react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  categoryName?: string;
}

export const PLACEHOLDER_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none"><rect width="400" height="400" fill="%23f5f5f4"/><path d="M160 220L190 180L220 220L250 170L290 230H110L160 220Z" fill="%23d6d3d1"/><circle cx="150" cy="150" r="20" fill="%23d6d3d1"/><text x="50%" y="78%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="500" fill="%23a8a29e">No Image Added</text></svg>`;

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'Product Image',
  fallbackSrc = PLACEHOLDER_IMAGE,
  className = '',
  ...props
}) => {
  const [error, setError] = useState(false);

  const finalSrc = error || !src ? fallbackSrc : src;

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (!error) {
          setError(true);
        }
      }}
      {...props}
    />
  );
};

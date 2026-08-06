import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0 to 5
  count?: number;
  size?: number;
  showText?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  count,
  size = 15,
  showText = true
}) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= Math.round(rating)
                ? 'text-amber-500 fill-amber-500'
                : 'text-stone-300'
            }`}
          />
        ))}
      </div>
      {showText && (
        <span className="text-xs font-medium text-stone-700 ml-0.5">
          {rating.toFixed(1)} {count !== undefined && <span className="text-stone-400 font-normal">({count})</span>}
        </span>
      )}
    </div>
  );
};

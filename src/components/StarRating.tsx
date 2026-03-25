import React from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "../lib/utils";

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: number;
  className?: string;
  showCount?: boolean;
}

export default function StarRating({ 
  rating, 
  count, 
  size = 14, 
  className,
  showCount = true 
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={size} className="fill-amber-400 text-amber-400" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star size={size} className="text-slate-700" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star size={size} className="fill-amber-400 text-amber-400" />
            </div>
          </div>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-slate-700" />
        ))}
      </div>
      {showCount && (
        <span className="text-[10px] font-bold text-slate-500 tracking-wider">
          {rating.toFixed(1)} {count !== undefined && `(${count})`}
        </span>
      )}
    </div>
  );
}

import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  total?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ total = 5 }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, idx) => (
        <Star key={idx} className="w-5 h-5 text-gray-300 fill-gray-300" />
      ))}
    </div>
  );
};

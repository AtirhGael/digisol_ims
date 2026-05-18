import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  total?: number;
  value?: number;
  onChange?: (value: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({ total = 5, value = 0, onChange }) => {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => onChange?.(idx + 1)}
          className="transition-transform hover:scale-105"
        >
          <Star
            className={`w-5 h-5 ${
              idx < value ? "text-yellow-500 fill-yellow-400" : "text-gray-300 fill-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

import React from "react";
import "./Loader.css";

export const Loader = () => {
  return (
    <div className="backdrop-blur-sm min-h-[87vh] flex items-center justify-center z-20">
      <div className="text-center">
        {/* Main Spinner */}
        <div className="relative mb-6">
          {/* Center Dot */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full animate-pulse"></div>
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center space-x-2 mb-4">
          <div className="loader-dot-1 w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          <div className="loader-dot-2 w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          <div className="loader-dot-3 w-3 h-3 bg-primary rounded-full animate-bounce"></div>
        </div>

        {/* Loading Text */}
        <div className="text-gray-600">
          <h3 className="text-lg font-semibold mb-2 animate-pulse">
            Loading...
          </h3>
          <p className="text-sm text-gray-500">
            Please wait while we prepare everything for you
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-64 h-1 bg-gray-200 rounded-full overflow-hidden relative">
          <div className="h-full bg-linear-to-r from-primary to-secondary animate-pulse"></div>
          <div className="loader-slide h-full bg-primary absolute w-full rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

import React from "react";

interface ErrorProps {
  message?: string;
  title?: string;
}

export const Error: React.FC<ErrorProps> = ({
  message = "An unexpected error occurred. Please try again.",
  title = "Error",
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[87vh] p-8 text-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
          <svg
            className="w-6 h-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-red-800 mb-2">{title}</h2>
        <p className="text-red-600 text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
};

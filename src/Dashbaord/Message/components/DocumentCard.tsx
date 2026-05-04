
import React from 'react';
import { FaFilePdf, FaFileWord, FaFileLines, FaEye, FaDownload } from 'react-icons/fa6';
import type { Source } from '../types';

interface DocumentCardProps {
    source: Source;
}

export const DocumentCard = ({ source }: DocumentCardProps) => {

    // Determine icon based on filename extension (mock logic)
    const getIcon = (filename: string) => {
        if (filename.endsWith('.pdf')) return <FaFilePdf className="text-red-500 text-2xl" />;
        if (filename.endsWith('.docx')) return <FaFileWord className="text-blue-500 text-2xl" />;
        return <FaFileLines className="text-gray-500 text-2xl" />;
    };

    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-2 flex flex-col gap-2 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-3">
                <div className="bg-gray-50 p-3 rounded-xl">
                    {getIcon(source.filename)}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 text-sm truncate" title={source.filename}>
                        {source.filename}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="bg-pink-100 text-pink-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                            Page {source.page_number}
                        </span>
                        <span className="text-xs text-gray-400">Relevance: {Math.round(source.relevance_score * 100)}%</span>
                    </div>
                </div>
                <div className="flex gap-1">
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <FaEye />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                        <FaDownload />
                    </button>
                </div>
            </div>

            {/* Snippet preview */}
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg italic line-clamp-2">
                "...{source.snippet}..."
            </div>
        </div>
    );
};

import React from 'react';
import { FaClipboardCheck, FaChartSimple } from 'react-icons/fa6';

interface DocumentStatsProps {
    totalDocuments: number;
    totalSize: string;
}

export const DocumentStats = ({ totalDocuments, totalSize }: DocumentStatsProps) => {
    return (
        <div className="flex flex-wrap gap-6 mb-4">
            {/* Total Documents Card - Gradient */}
            <div className="bg-linear-to-br from-[#4d4ba3] to-[#2c2b64] p-6 rounded-3xl relative overflow-hidden min-w-[320px] h-[180px] flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <p className="text-white text-xl font-medium">Total Documents</p>
                    <div className="bg-white p-2 rounded-xl">
                        <FaClipboardCheck className="text-black text-xl" />
                    </div>
                </div>
                <div>
                    <h2 className="text-6xl font-bold text-white mb-1">{totalDocuments}</h2>
                    <p className="text-white/70 text-sm">Available in database</p>
                </div>
            </div>

            {/* Total Size Card - White */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 min-w-70 h-45 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <p className="text-[#32CD32] text-xl font-bold">Total Size</p>
                    <div className="bg-[#32CD32] p-2 rounded-xl">
                        <FaChartSimple className="text-white text-xl" />
                    </div>
                </div>
                <div>
                    <h2 className="text-6xl font-bold text-[#32CD32] mb-1">{totalSize}</h2>
                    <p className="invisible text-sm">Spacer</p>
                </div>
            </div>
        </div>
    );
};


import React from 'react';
import { FaClock, FaMagnifyingGlass } from 'react-icons/fa6';

export const HistorySidebar = () => {
    // Mock history
    const historyItems = [
        "Find all HR documents from last month",
        "Show me contracts with Client ABC",
        "What documents did John upload today?",
        "Find the latest financial report"
    ];

    return (
        <div className="w-80 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <FaMagnifyingGlass className="text-gray-400" />
                <h3 className="font-bold text-gray-700">Search History</h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
                <div className="space-y-3">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Recent</p>
                    {historyItems.map((item, idx) => (
                        <div key={idx} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                            <FaClock className="text-gray-300 mt-1 group-hover:text-[#423d8a]" />
                            <p className="text-sm text-gray-600 group-hover:text-gray-900 line-clamp-2">
                                {item}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <button className="text-center text-xs font-bold text-[#1e90ff] hover:underline mt-4">
                Clear history
            </button>
        </div>
    );
};

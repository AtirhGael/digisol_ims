
import React, { useState, KeyboardEvent } from 'react';
import { FaPaperPlane } from 'react-icons/fa6';
import { BeatLoader } from 'react-spinners';

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
}

export const ChatInput = ({ onSend, isLoading }: ChatInputProps) => {
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            onSend(input);
            setInput("");
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !isLoading) {
            handleSend();
        }
    };

    return (
        <div className="bg-white p-2 pl-6 rounded-full border border-gray-200 shadow-sm flex items-center gap-2">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about documents... e.g., 'Find contracts from Q4 2024'"
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder:text-gray-400 text-sm h-10"
                disabled={isLoading}
            />
            <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${input.trim() && !isLoading
                        ? 'bg-[#423d8a] text-white hover:bg-[#34306e] shadow-md'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
            >
                {isLoading ? <BeatLoader size={6} color="#ffffff" /> : <FaPaperPlane className="text-sm ml-[-2px]" />}
            </button>
        </div>
    );
};

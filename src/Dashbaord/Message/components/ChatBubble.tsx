
import React from 'react';
import { FaUser, FaRobot } from 'react-icons/fa6';
import type { ChatMessage, Source } from '../types';
import { DocumentCard } from './DocumentCard';
// import ReactMarkdown from 'react-markdown';

interface ChatBubbleProps {
    message: ChatMessage;
}

export const ChatBubble = ({ message }: ChatBubbleProps) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start animate-fade-in-up`}>
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-[#1e90ff] text-white' : 'bg-white border-2 border-[#E6E6FA] text-[#423d8a]'
                }`}>
                {isUser ? <FaUser className="text-sm" /> : <FaRobot className="text-lg" />}
            </div>

            {/* Message Content */}
            <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${isUser
                    ? 'bg-[#1e90ff] text-white rounded-tr-none'
                    : 'bg-white text-gray-700 border border-[#f0f0f5] rounded-tl-none'
                    }`}>
                    {/* Access sources directly if backend embeds them in text, or simple text */}
                    {isUser ? (
                        message.content
                    ) : (
                        <div className="markdown-content whitespace-pre-wrap">
                            {/* Render AI response with Markdown support */}
                            {/* <ReactMarkdown>{message.content}</ReactMarkdown> */}
                            {message.content}
                        </div>
                    )}
                </div>

                {/* Sources / Attachments */}
                {!isUser && message.sources && message.sources.length > 0 && (
                    <div className="w-full mt-2 space-y-2">
                        <p className="text-xs text-gray-500 font-medium ml-1">
                            I found {message.sources.length} relevant documents:
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            {message.sources.map((source, idx) => (
                                <DocumentCard key={`${source.document_id}-${idx}`} source={source} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Timestamp */}
                <span className="text-[10px] text-gray-400 px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
};

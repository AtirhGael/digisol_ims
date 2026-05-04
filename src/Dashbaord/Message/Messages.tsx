
import React, { useState, useRef, useEffect } from 'react';
import { FaPlus, FaWandMagicSparkles } from 'react-icons/fa6';
import { Button } from '../../components/ui/button';
import { HistorySidebar } from './components/HistorySidebar';
import { ChatBubble } from './components/ChatBubble';
import { ChatInput } from './components/ChatInput';
import type { ChatMessage, Source, StreamChunk } from './types';
import { streamChat } from './api';

export const Messages = () => {

  // Initial welcome message
  const initialMessage: ChatMessage = {
    role: "assistant",
    content: "Hello! I'm your AI document assistant. I can help you find any document in the system. \n\nTry asking me something like:\n\n* \"Find all HR documents from last month\"\n* \"Show me contracts with Client ABC\"\n* \"What documents did John upload today?\"",
    timestamp: new Date()
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Placeholder for new assistant message
      const assistantMsgId = Date.now();
      let currentContent = "";
      let currentSources: Source[] = [];

      // Add temp assistant message
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "",
        timestamp: new Date(),
        sources: []
      }]);

      await streamChat(text, messages, (chunk: StreamChunk) => {
        if (chunk.type === "sources") {
          currentSources = chunk.data || [];
        } else if (chunk.type === "token") {
          currentContent += chunk.content || "";
        }

        // Update last message
        setMessages(prev => {
          const newMsgs = [...prev];
          const lastMsg = newMsgs[newMsgs.length - 1];
          if (lastMsg.role === "assistant") {
            lastMsg.content = currentContent;
            lastMsg.sources = currentSources;
          }
          return newMsgs;
        });
      });

    } catch (error) {
      console.error("Chat error:", error);
      // Add error notification if needed
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([initialMessage]);
  };

  return (
    <div className="bg-[#f8fafe] min-h-screen p-6 flex gap-6 h-[calc(100vh-80px)]">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col gap-6">

        {/* Header */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-pink-100 p-2 rounded-xl">
              <FaWandMagicSparkles className="text-pink-500 text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AI Document Assistant</h1>
              <p className="text-sm text-gray-500">Search and retrieve documents using natural language</p>
            </div>
          </div>
          <Button
            onClick={handleNewChat}
            className="bg-[#423d8a] hover:bg-[#34306e] text-white px-6 h-10 rounded-xl font-bold shadow-lg flex items-center gap-2"
          >
            <FaPlus className="text-sm" />
            New Chat
          </Button>
        </div>

        {/* Chat Window */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col overflow-hidden relative">

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-6 mb-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <ChatBubble key={idx} message={msg} />
            ))}
            <div ref={messagesEndRef} />

            {isLoading && messages[messages.length - 1].content === "" && (
              <div className="flex gap-4 items-start animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="h-10 bg-gray-100 rounded-2xl w-24" />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="mt-auto">
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>

      </div>

      {/* Sidebar (History) */}
      <div className="hidden lg:block h-full">
        <HistorySidebar />
      </div>
    </div>
  );
};

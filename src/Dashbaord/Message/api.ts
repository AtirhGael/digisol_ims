
import type { ChatMessage, StreamChunk } from "./types";

const API_BASE_URL = "http://localhost:8002/api/v1";

export const streamChat = async (
    message: string,
    history: ChatMessage[],
    onChunk: (chunk: StreamChunk) => void
) => {
    // Mock user context - replace with real auth later
    const userContext = {
        user_id: "current_user_id",
        department: "Finance",
        role: "Admin"
    };

    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-user-data": JSON.stringify(userContext)
        },
        body: JSON.stringify({
            user_id: userContext.user_id,
            department: userContext.department,
            role: userContext.role,
            message: message,
            conversation_history: history.map(h => ({
                role: h.role,
                content: h.content
            })),
            top_k: 5
        })
    });

    if (!response.ok) {
        throw new Error("Failed to send message");
    }

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
            if (line.trim()) {
                try {
                    const chunk = JSON.parse(line);
                    onChunk(chunk);
                } catch (e) {
                    console.error("Error parsing chunk:", e);
                }
            }
        }
    }
};

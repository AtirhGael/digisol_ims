
export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
    sources?: Source[];
}

export interface Source {
    document_id: string;
    filename: string;
    relevance_score: number;
    page_number: number;
    snippet: string;
    // Additional UI fields
    file_type?: string;
}

export interface StreamChunk {
    type: "sources" | "token" | "error";
    data?: Source[];
    content?: string;
    message?: string;
}

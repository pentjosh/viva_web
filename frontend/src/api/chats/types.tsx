export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    timestamp: string;
}

export interface ChatModel {
    id: string; 
    user_id: string;
    title: string;
    messages: ChatMessage[];
    created_at?: string;
    updated_at?: string;
    archived: boolean;
    pinned?: boolean;
}

export type ChatList = {
    role: 'user' | 'model';
    message: string;
};

export type ChatHistorySummary = {
    id: string;
    title: string;
};
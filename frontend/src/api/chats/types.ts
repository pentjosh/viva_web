import { FileType } from "../files/types";

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    files?: FileType[];
    timestamp: string;
};

export interface ChatModel {
    id: string; 
    user_id: string;
    title: string;
    messages: ChatMessage[];
    type?: string;
    websearch?: boolean;
    created_at?: string;
    updated_at?: string;
    // archived: boolean;
    // pinned?: boolean;
};

export type ChatList = {
    role: 'user' | 'model';
    message: string;
    files?: FileType[];
};

export type ChatHistorySummary = {
    id: string;
    title: string;
};
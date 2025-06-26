import { ChatModel } from "./types";

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const generateChat = async (content: string, chat_id: string | null): Promise<ChatModel> => {

    const chatPayload = { content: content, chat_id: chat_id};

    try {
        const response = await fetch(`${baseUrl}/api/chat/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(chatPayload),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Network response was not ok');
        }

        const data: ChatModel = await response.json();
        return data;
    }
    catch (error) {
        console.error('Error fetching chat completion:', error);
        throw error
    }
};

export const getChatHistory = async(): Promise<ChatModel[]> => {
    const response = await fetch(`${baseUrl}/api/chat/history`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if(!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Network response was not ok');
    }
    
    return response.json();
};
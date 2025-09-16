import { ChatModel, ChatHistorySummary } from "./types";
import { BASE_URL } from '../base';
import { FileType } from "../files/types"

//const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const page_size = 20;

export const generateChat = async (content: string, chat_id: string | null, files: FileType[], chat_type: string, web_search: boolean): Promise<ChatModel> => {
    const file_ids = files.map(file => file.id);
    const chatPayload = { content: content, chat_id: chat_id, file_ids: file_ids, chat_type: chat_type, web_search : web_search};

    try {
        const response = await fetch(`${BASE_URL}/api/chat/generate`, {
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

export const getChatById = async(chatId: string): Promise<ChatModel> => {
    const response = await fetch(`${BASE_URL}/api/chat/${chatId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to load chat.');
    }
    const data: ChatModel = await response.json();
    return data;
}

export const getChatHistory = async(page: number): Promise<ChatHistorySummary[]> => {
    const skip = (page - 1) * page_size;
    const response = await fetch(`${BASE_URL}/api/chat/summary?skip=${skip}&limit=${page_size}`, {
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

export const deleteChatById = async(chatId:string): Promise<boolean>=>{
    try{
        const response = await fetch(`${BASE_URL}/api/chat/delete/${chatId}`,{
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });

        if(!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Network response was not ok');
        }
        return await response.json();
    }
    catch(error){
        console.log("Error deleting chat : ", error);
        throw error;
    }
}
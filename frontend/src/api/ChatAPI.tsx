const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_URL = `${baseUrl}/api/chat/completion`;

const ChatAPI = async (messages: string): Promise<string> => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ messages }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Network response was not ok');
        }

        return data.response;
    }
    catch (error) {
        console.error('Error fetching chat completion:', error);
        return 'Error fetching chat completion';
    }
}

export default ChatAPI;
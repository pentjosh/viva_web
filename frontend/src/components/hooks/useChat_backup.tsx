import { useState, useRef } from "react";
import chats from "../../api/chats/chats";
import { ChatType } from '../../api/chats/types';
import { toast } from 'react-toastify';

export const useChat = ()=>{
    const [chatList, setChatList] = useState<ChatType[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [streamedMessage, setStreamedMessage] = useState('');
    const typingInterval = useRef<number | null>(null);

    const sendMessage = async (message: string)=> {
        const userMessage = message.trim();
        if (!userMessage || isTyping) return;

        setChatList(prev => [
            ...prev,
            { role: "user", message: userMessage } as ChatType
        ]);

        setIsTyping(true);
        setStreamedMessage('');

        try{
            const history = [
                ...chatList,
                { role: "user", message: userMessage } as ChatType
            ];
            const response = await chats(history);

            if(response){
                let i = 0;
                if (typingInterval.current) clearInterval(typingInterval.current);

                typingInterval.current = setInterval(() => {
                    setStreamedMessage(response.slice(0, i + 1));
                    i++;
                    if (i >= response.length) {
                        clearInterval(typingInterval.current!);
                        setIsTyping(false);
                        setChatList(prev => [...prev, { role: 'system', message: response }]);
                        setStreamedMessage('');
                    }
                }, 20);
            }
        }
        catch(error){
            setIsTyping(false);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error(errorMessage);
        }
    }

    return { chatList, isTyping, streamedMessage, sendMessage };
};
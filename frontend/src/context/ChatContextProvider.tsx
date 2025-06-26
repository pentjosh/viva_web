import React, { useState, useRef, ReactNode, useEffect } from "react";
import { toast } from 'react-toastify';
import { ChatList, ChatMessage, ChatModel  } from "../api/chats/types";
import { generateChat, getChatHistory }  from "../api/chats/chats";
import ChatContext from "./ChatContext";
import { useAuth } from '../components/hooks/useAuth';

export const ChatContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [chatList,  setChatList] =  useState<ChatList[]>([]);
    const [chatID, setChatID] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [streamedMessage, setStreamedMessage] = useState('');
    const typingInterval = useRef<number | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatModel[]>([]);
    const { isLoggedIn } = useAuth();

    const startNewChat = () => {
        setChatID(null);
        setChatList([]);
        setStreamedMessage('');
        if (typingInterval.current) {
            clearInterval(typingInterval.current);
        }
        setIsTyping(false);
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const historyData = await getChatHistory();
                setChatHistory(historyData || []);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Failed to load chat history.";
                throw Error(errorMessage);
            }
        };

        if(isLoggedIn()){
            fetchHistory();
        }
        else{
            setChatHistory([]);
        }
    }, [isLoggedIn]);

    const loadChat = (chatId: string) => {
        const selectedChat = chatHistory.find(chat => chat.id === chatId);
        if (selectedChat) {
            setChatID(selectedChat.id);
            setChatList(selectedChat.messages.map((msg: ChatMessage) => ({ role: msg.role, message: msg.content })));
            setStreamedMessage('');
            setIsTyping(false);
        }
    };

    const sendMessage = async (message: string) => {
        const userMessage = message.trim();
        const isNewChat = chatID === null;
        if (!userMessage || isTyping) return;

        setChatList(prev => [
            ...prev,
            { role: "user", message: userMessage }
        ]);

        setIsTyping(true);
        setStreamedMessage('');

        try {
            const response = await generateChat(userMessage, chatID);
            
            if (response && response.messages) {
                setChatID(response.id);

                if (isNewChat) {
                    setChatHistory(prevHistory => [response, ...prevHistory]);
                }

                const botMessageContent = response.messages[response.messages.length - 1].content;
                
                let i = 0;
                if (typingInterval.current) clearInterval(typingInterval.current);

                typingInterval.current = setInterval(() => {
                    setStreamedMessage(botMessageContent.slice(0, i + 1));
                    i++;
                    if (i >= botMessageContent.length) {
                        clearInterval(typingInterval.current!);
                        setIsTyping(false);
                        setChatList(response.messages.map(msg => ({ role: msg.role, message: msg.content })));
                        setStreamedMessage('');
                    }
                }, 5);
            }
        }
        catch (error) {
            setIsTyping(false);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error(errorMessage);
            setChatList(prev => prev.slice(0, prev.length -1));
        }
    };

    const contextValue = {
        chatList,
        isTyping,
        streamedMessage,
        sendMessage,
        startNewChat,
        chatHistory,
        loadChat,
        chatID,
    };

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
    
};

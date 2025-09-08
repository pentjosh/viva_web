import React, { useState, useRef, ReactNode, useCallback, useEffect } from "react";
import { toast } from 'react-toastify';
import { ChatHistorySummary, ChatList } from "../api/chats/types";
import { generateChat, getChatHistory, getChatById, page_size, deleteChatById }  from "../api/chats/chats";
import ChatContext from "./ChatContext";
import { useAuth } from "../components/hooks/useAuth";
import { FileType } from "../api/files/types";

export const ChatContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [chatList,  setChatList] =  useState<ChatList[]>([]);
    const [chatID, setChatID] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [streamedMessage, setStreamedMessage] = useState('');
    const typingInterval = useRef<number | null>(null);
    const { isLoggedIn } = useAuth();
    const [chatHistory, setChatHistory] = useState<ChatHistorySummary[]>([]);
    const [chatHistoryPage, setChatHistoryPage ] = useState(1);
    const [hasMoreHistory, setHasMoreHistory] = useState(true);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [chatType, setChatType] = useState("general");
    const [webSearch, setWebSearch] = useState(false);

    const deleteChat = async(chatIdToDelete: string) => {
        const previousChatHistory = chatHistory;
        setChatHistory(prevChatHistory => prevChatHistory.filter(chat => chat.id !== chatIdToDelete));
        if (chatID === chatIdToDelete) {
            startNewChat();
        };
        try{
            const deleted_chat = await deleteChatById(chatIdToDelete);
            if (!deleted_chat) {
                throw new Error("Server indicated failure to delete.");
            }
            toast.success("Chat deleted successfully!");
        }
        catch(error){
            setChatHistory(previousChatHistory);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast.error(errorMessage);
        }
    };

    const startNewChat = () => {
        setChatID(null);
        setChatList([]);
        setChatType("general");
        setWebSearch(false);
        setStreamedMessage("");
        if (typingInterval.current) {
            clearInterval(typingInterval.current);
        };
        setIsTyping(false);
    };

    const loadMoreChatHistory = useCallback(async () => {
        if (isHistoryLoading || !hasMoreHistory) return;

        setIsHistoryLoading(true);
        try {
            const historyData = await getChatHistory(chatHistoryPage);
            setChatHistory(prev => [...prev, ...historyData]);
            if (historyData.length < page_size) {
                setHasMoreHistory(false);
            } else {
                setChatHistoryPage(prevPage => prevPage + 1);
            }
        } catch {
            toast.error("Failed to load chat history.");
        } finally {
            setIsHistoryLoading(false);
        }
    }, [isHistoryLoading, hasMoreHistory, chatHistoryPage]);

    useEffect(() => {
        if(isLoggedIn()){
            const initialFetchChatHistory = async() => {
                setIsHistoryLoading(true);
                setChatHistory([]);
                setHasMoreHistory(true);
                try{
                    const initData = await getChatHistory(1);
                    setChatHistory(initData);
                    if(initData.length < page_size){
                        setHasMoreHistory(false);
                    }
                    setChatHistoryPage(2);
                }
                catch{
                    toast.error("Failed to initial load chat history.");
                }
                finally{
                    setIsHistoryLoading(false);
                }
            
            }
            initialFetchChatHistory();
        }
        else{
            setChatHistory([]);
            setChatHistoryPage(1);
            setHasMoreHistory(true);
        }
    }, [isLoggedIn]);

    const loadChat = async (chatId: string) => {
        if(chatId === chatID) return;
        setStreamedMessage('');

        try{
            const selectedChat = await getChatById(chatId);
            setChatID(selectedChat.id);
            setChatList(selectedChat.messages.map(msg => ({ role: msg.role, message: msg.content, files: msg.files })));
            setChatType(selectedChat.type || "general");
        }
        catch{
            toast.error("Failed to load chat.");
        }
    };

    const sendMessage = async (message: string, files:FileType[]) => {
        const userMessage = message.trim();
        const isNewChat = chatID === null;
        if (!userMessage && files.length === 0 || isTyping) return;

        setChatList(prev => [
            ...prev,
            { role: "user", message: userMessage, files: files }
        ]);

        setIsTyping(true);
        setStreamedMessage('');

        try {
            const response = await generateChat(userMessage, chatID, files, chatType, webSearch);
            
            if (response && response.messages) {
                setChatID(response.id);

                if (isNewChat) {
                    const summary: ChatHistorySummary = { id:response.id, title: response.title};
                    setChatHistory(prevHistory => [summary, ...prevHistory]);
                }

                const botMessageContent = response.messages[response.messages.length - 1].content;
                
                let i = 0;
                const chunkSize = 10;
                if (typingInterval.current) clearInterval(typingInterval.current);

                typingInterval.current = setInterval(() => {
                    setStreamedMessage(botMessageContent.slice(0, i + chunkSize));
                    i += chunkSize;
                    if (i >= botMessageContent.length) {
                        clearInterval(typingInterval.current!);
                        setIsTyping(false);
                        setChatList(response.messages.map(msg => ({ role: msg.role, message: msg.content, files: msg.files })));
                        setStreamedMessage('');
                    }
                }, 10);
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
        hasMoreHistory,
        isHistoryLoading,
        loadMoreChatHistory,
        deleteChat,
        chatType,
        setChatType,
        webSearch,
        setWebSearch
    };

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
    
};

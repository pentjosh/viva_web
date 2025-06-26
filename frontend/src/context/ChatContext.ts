import { createContext } from "react";
import { ChatList, ChatModel } from "../api/chats/types";

// export interface ChatContextType {
//     prevPrompts: string[];
//     setPrevPrompts: React.Dispatch<React.SetStateAction<string[]>>;
//     onSent: (prompt?: string) => Promise<void>;
//     setRecentPrompt: React.Dispatch<React.SetStateAction<string>>;
//     recentPrompt: string;
//     showResult: boolean;
//     loading: boolean;
//     resultData: string;
//     input: string;
//     setInput: React.Dispatch<React.SetStateAction<string>>;
//     newChat: () => void;
//     scrollRef: RefObject<HTMLDivElement | null>;
// }

export interface ChatContextType {
    chatList: ChatList[];
    isTyping: boolean;
    streamedMessage: string;
    sendMessage: (message: string) => Promise<void>;
    startNewChat: () => void;
    chatHistory: ChatModel[];
    loadChat: (chatId: string) => void;
    chatID: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);
export default ChatContext;
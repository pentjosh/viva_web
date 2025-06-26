import { useContext } from "react";
import ChatContext, { ChatContextType } from "../../context/ChatContext";

export const useChat = ()=>{
    const context = useContext<ChatContextType | undefined>(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatContextProvider");
    }
    return context;
};
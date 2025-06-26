import React, { useState, useRef, ReactNode, useEffect  } from "react";
import ChatAPI from "../api/ChatAPI";
import { marked } from "marked";
import DOMPurify from "dompurify";
import ChatContext, { ChatContextType } from "./ChatContext";

const ChatContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [input, setInput] = useState<string>("");
    const [recentPrompt, setRecentPrompt] = useState<string>("");
    const [prevPrompts, setPrevPrompts] = useState<string[]>([]);
    const [showResult, setShowResult] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [resultData, setResultData] = useState<string>("");

    const abortRef = useRef<boolean>(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const delayPara = (index: number, nextWord: string) => {
        setTimeout(() => {
            if (!abortRef.current) {
                setResultData((prev) => prev + nextWord);
            }
        }, index * 20);
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [resultData]);

    const newChat = () => {
        setLoading(false);
        setShowResult(false);
        setResultData("");
        abortRef.current = true;
        setTimeout(() => {
            abortRef.current = false;
        }, 100);
    };

    const onSent = async (prompt?: string) => {
        try {
            setResultData("");
            setLoading(true);
            setShowResult(true);
            abortRef.current = false;

            let response: string;

            if (prompt !== undefined) {
                response = await ChatAPI(prompt);
                setRecentPrompt(prompt);
            } else {
                setPrevPrompts((prev) => [...prev, input]);
                setRecentPrompt(input);
                response = await ChatAPI(input);
            }

            const rawHtml = await marked.parse(response);
            const htmlResponse = DOMPurify.sanitize(rawHtml);

            const words = htmlResponse.split(" ");
            for (let i = 0; i < words.length; i++) {
                if (abortRef.current) break;
                delayPara(i, words[i] + " ");
            }
        } catch (err) {
            console.error("Error during chat:", err);
            setResultData("Failed response.");
        } finally {
            setLoading(false);
            setInput("");
        }
    };

    const chatContextValue: ChatContextType = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        setRecentPrompt,
        recentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat,
        scrollRef
    };

    return (
        <ChatContext.Provider value={chatContextValue}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatContextProvider;

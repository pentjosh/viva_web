import { Copy } from 'lucide-react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
//import remarkGfm from "remark-gfm";

interface BotChatBubleProps {
    message?: string
}

export const BotChatBubble = ({message}:BotChatBubleProps) => {
    const bubbleRef = React.useRef<HTMLDivElement>(null);

    const handleCopy = () => {
        if (!message) return;
        if (bubbleRef.current) {
            navigator.clipboard.writeText(bubbleRef.current.innerText || "");
            showToast("Copied to clipboard");
        }
    }
    
    const showToast = (msg:string) => {
        const toastroot = document.getElementById("toast-root");
        if(!toastroot) return;
        const alertdiv = document.createElement("div");
        alertdiv.className = "alert alert-success";
        alertdiv.innerHTML = `<span class="text-white">${msg}</span>`;
        toastroot.appendChild(alertdiv);
        setTimeout(()=>{alertdiv.remove()},1500);
    }

    return (
        <div className="flex w-full justify-start">
            <div className="flex flex-col max-w-full group">
                <div className="flex">
                    <div className="prose prose-sm whitespace-break-spaces break-words overflow-x-auto text-sm" ref={bubbleRef}>
                       {/* <ReactMarkdown>{String(message).replace(/(\[.*?\])/g, "$1\n")}</ReactMarkdown> */}
                        <ReactMarkdown>{String(message)}</ReactMarkdown>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button onClick={handleCopy} className="flex items-center justify-center p-1.25 rounded-lg hover:bg-base-300 invisible group-hover:visible
                    transition-opacity duration-200 cursor-pointer tooltip tooltip-top" tabIndex={-1} data-tip="Copy" type="button">
                        <Copy size={14} />
                    </button>
                </div>
            </div>
        </div>
    )
}
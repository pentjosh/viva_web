import { Copy, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { FileType } from '../../api/files/types';
import { FileIcon, defaultStyles } from 'react-file-icon';
import { useEffect, useState, useRef } from 'react';

interface UserChatBubbleProps {
    message?: string;
    files?: FileType[];
}

export const UserChatBubble = ({message, files}:UserChatBubbleProps) => {
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const maxUserTextLength = 300;
    const [isExpanded, setIsExpanded] = useState(false);
    const isLongMessage = message && message.length > maxUserTextLength;

    const handleCopy = () => {
        if(!message) return
        navigator.clipboard.writeText(message);
        showToast("Copied to clipboard");
    };
    
    const showToast = (msg:string) => {
        const toastroot = document.getElementById("toast-root");
        if(!toastroot) return;
        const alertdiv = document.createElement("div");
        alertdiv.className = "alert alert-success";
        alertdiv.innerHTML = `<span class="text-white">${msg}</span>`;
        toastroot.appendChild(alertdiv);
        setTimeout(()=>{alertdiv.remove()},1500);
    };

    const checkArrows = () => {
        const container = scrollContainerRef.current;
        if (container) {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => checkArrows(), 400);
        window.addEventListener('resize', checkArrows);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', checkArrows);
        }
        // return () => window.removeEventListener('resize', checkArrows);
    }, [files]);

    const handleScroll = (direction: 'left' | 'right') => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = 300;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
            setTimeout(() => checkArrows(), 400);
        }
    };

    useEffect(()=> {
        console.log("Is long message : " + isLongMessage);
        console.log("Expand :" + isExpanded);
    },[isLongMessage, isExpanded])

    return (
        <div className="flex flex-col w-full items-end gap-1">
            {files && files.length > 0 && (
            <div className="relative flex w-full justify-end items-center">
                    {showLeftArrow && (
                    <button onClick={() => handleScroll('left')} className="absolute btn btn-ghost btn-circle left-1 top-[0.5] z-10 p-1 bg-base-300">
                        <ChevronLeft size={16} />
                    </button>)}

                    <div ref={scrollContainerRef} onScroll={checkArrows} className="flex gap-2 overflow-x-auto scroll-hidden">
                        {files?.map((file, key) => {
                            const extension = file.name.split(".").pop() || "";
                            return (
                        <div key={key} className="flex bg-base-200 border border-base-content/20 rounded-lg p-5 gap-3">
                            <div className="size-6">
                                <FileIcon color="mistyrose" extension={extension} {...defaultStyles[extension as keyof typeof defaultStyles]} />
                            </div>
                            <div className="text-sm w-[160px] truncate">{file.name}</div>
                        </div>)                     
                        })}
                    </div>
                    
                    {showRightArrow && (
                    <button onClick={() => handleScroll('right')} className="absolute btn btn-ghost btn-circle right-1 top-[0.5] z-10 p-1 bg-base-300">
                        <ChevronRight size={16} />
                    </button>)}
            </div>)}
            
            {message && (
            <div className="flex group max-w-2xl">
                <div className="flex flex-col gap-1">
                    <div className="relative bg-base-200 border border-base-content/10 rounded-bl-2xl rounded-br-2xl rounded-tl-2xl px-4 py-2.5 break-words text-sm prose prose-sm whitespace-break-spaces shadow-xs">
                        {/* {message} */}
                        {/* {isLongMessage && !isExpanded ? `${message.substring(0, maxUserTextLength)}...` : message} */}
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-auto' : 'max-h-16'}`}>
                            {message}
                        </div>
                        {isLongMessage && (
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)} 
                                className="absolute top-1 right-1 btn btn-ghost btn-circle btn-xs p-1 z-10"
                            >
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                        )}
                    </div>
                    <div className="flex justify-end">
                        <button onClick={handleCopy} className="flex items-center justify-center p-1.25 bg-base-200 rounded-lg invisible group-hover:visible 
                        transition-opacity duration-200 hover:bg-base-300 tooltip tooltip-bottom cursor-pointer" data-tip="Copy" tabIndex={-1} type="button">
                            <Copy size={13} />
                        </button>
                    </div>
                </div>
            </div>
            )}
        </div>
    )
}
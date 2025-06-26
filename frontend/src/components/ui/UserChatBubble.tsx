import { Copy } from 'lucide-react';

interface UserChatBubbleProps {
    message?: string;
}

export const UserChatBubble = ({message}:UserChatBubbleProps) => {
    const handleCopy = () => {
        if(!message) return
        navigator.clipboard.writeText(message);
        showToast("Copied to clipboard");
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
        <div className="flex w-full justify-end">
            <div className="flex flex-col gap-2 group">
                <div className="bg-base-200 rounded-2xl px-4 py-2.5 max-w-2xl break-words text-sm prose prose-sm whitespace-break-spaces">
                    {message}
                </div>
                <div className="flex justify-end items-end">
                    <button onClick={handleCopy} className="flex items-center justify-center p-2 bg-base-200 rounded-lg invisible group-hover:visible 
                    transition-opacity duration-200 hover:bg-base-300 tooltip tooltip-bottom cursor-pointer" data-tip="Copy" tabIndex={-1} type="button">
                        <Copy size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}
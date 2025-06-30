import { PanelLeftClose, MessageCircle, MessageSquareCode, Loader } from "lucide-react";
import useLogo from "../hooks/useLogo";
import { Link, useNavigate } from "react-router-dom";
import ChatItemHistory from "../ui/ChatItemHistory"; 
import { useChat } from "../hooks/useChat";
import { useCallback, useRef } from "react";

interface SidebarProps {
    isSideBarOpen: boolean;
    onToggle: () => void;
}

const Sidebar = ({isSideBarOpen, onToggle} : SidebarProps) => {
    const navigate = useNavigate();
    const logo = useLogo();
    const { chatHistory, loadChat, chatID, startNewChat, hasMoreHistory, isHistoryLoading, loadMoreChatHistory, deleteChat } = useChat();
    const menuItems = [
        { key:0, name: "Chat Me", to: "/", icon: <MessageCircle />, action: startNewChat },
        { key:2, name: "Data Query", to: "/query" , icon: <MessageSquareCode /> },
    ];

    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleScrollerContainer = useCallback(()=>{
        const container = scrollContainerRef.current;
        if(container){
            const { scrollTop, scrollHeight, clientHeight } = container;
            if (scrollHeight - scrollTop - clientHeight < 200 && !isHistoryLoading && hasMoreHistory) {
                loadMoreChatHistory();
            }
        }
    },[isHistoryLoading, hasMoreHistory, loadMoreChatHistory]);

    const handleLoadChat = (chatId: string)=>{
        navigate(`/chat/${chatId}`);
        loadChat(chatId)
    }

    return (
    <div className={`h-full w-64 transition-all duration-300 bg-base-200 ${
        isSideBarOpen ? "ml-0" : "-ml-64"
      }`}>
        <div className="flex h-full min-h-0 flex-col">
            <div className="flex items-center justify-between h-16 px-4 bg-base-200">
                <div className="flex px-4">
                    <img className="w-32 md:w-32 lg:w-32 object-contain" src={logo} />
                </div>
                <button onClick={onToggle} className="btn btn-ghost focus:outline-none w-10 p-1 rounded-full">
                    <PanelLeftClose />
                </button>
            </div>

            <div className="flex-shrink-0 px-3 py-4">
                <ul className="space-y-1">
                {menuItems.map((item, index) => (
                    <li key={index}>
                        {item.action ? (
                            <Link onClick={startNewChat} to={item.to} className="flex justify-start btn btn-ghost rounded-3xl group">
                                {item.icon}
                            <span className="ms-3">
                                {item.name}
                            </span>
                        </Link>
                        ):
                        
                        (<Link to={item.to} className="flex justify-start btn btn-ghost rounded-3xl group">
                            {item.icon}
                            <span className="ms-3">
                                {item.name}
                            </span>
                        </Link>)}
                    </li>
                ))}
               </ul>
            </div>
            
            {chatHistory.length > 0 && (
            <div className="flex flex-col flex-grow min-h-0 px-2 pb-4">
                <h2 className="px-4 text-xs flex-shrink-0">Recent Chats</h2>
                <div className="flex-grow overflow-y-auto mt-2"
                    ref={scrollContainerRef} onScroll={handleScrollerContainer}>
                    <ul className="space-y-1">
                        {chatHistory.map((chat) => (
                            <li key={chat.id}>
                            <ChatItemHistory
                                id={chat.id}
                                title={chat.title}
                                isActive={chat.id === chatID}
                                onClick={() => handleLoadChat(chat.id)}
                                onDelete={deleteChat}
                            />
                            </li>
                        ))}
                    </ul>
                    {isHistoryLoading && (
                        <div className="flex justify-center items-center p-2">
                            <Loader className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                    )}
                </div>
            </div>)}
        </div>
    </div>
    )
}

export default Sidebar;
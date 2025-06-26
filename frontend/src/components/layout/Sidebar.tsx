import { PanelLeftClose, MessageCircle, MessageSquareCode } from "lucide-react";
import useLogo from "../hooks/useLogo";
import { Link, useNavigate } from "react-router-dom";
import ChatItemHistory from "../ui/ChatItemHistory"; 
import { useChat } from "../hooks/useChat";

interface SidebarProps {
    isSideBarOpen: boolean;
    onToggle: () => void;
}

const Sidebar = ({isSideBarOpen, onToggle} : SidebarProps) => {
    const navigate = useNavigate();
    const logo = useLogo();
    const { chatHistory, loadChat, chatID, startNewChat } = useChat();
    const menuItems = [
    { key:0, name: "Chat Me", to: "/", icon: <MessageCircle />, action: startNewChat },
    { key:2, name: "Data Query", to: "/query" , icon: <MessageSquareCode /> },
    ];

    const handleLoadChat = (chatId: string)=>{
        navigate("/");
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
            <div className="px-3 py-4">
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
            <div className="mt-4 px-3">
                <h2 className="px-4 text-xs">Recent Chats</h2>
                <ul className="space-y-2 mt-2">
                    <li className="space-y-1">
                        {chatHistory.map((chat) => (
                            <ChatItemHistory
                                key={chat.id}
                                title={chat.title}
                                isActive={chat.id === chatID}
                                onClick={() => handleLoadChat(chat.id)}
                            />
                        ))}
                    </li>
                </ul>
            </div>)}
        </div>
    </div>
    )
}

export default Sidebar;
import { EllipsisVertical, Trash2, SquarePen } from 'lucide-react';

interface ChatItemProps {
    title: string,
    isActive: boolean;
    onClick: ()=> void;
}

const ChatItemHistory = ({title, isActive, onClick}:ChatItemProps)=>{
    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    }

    return (
        <div className="flex flex-col">
            <div role="button" onClick={onClick} className={`flex items-center justify-between btn btn-ghost rounded-3xl w-full text-sm ${isActive ? 'btn-active' : ''} group font-medium`}>
                <span className="truncate">{title}</span>
                <div className="dropdown dropdown-right">
                    <div role="button" tabIndex={0} className="rounded-full hover:bg-base-200 p-1 flex items-center justify-center invisible 
                    group-hover:visible" onClick={handleMenuClick}>
                        <EllipsisVertical size={18} />
                    </div>
                    <ul tabIndex={0} className="menu dropdown-content bg-base-200 rounded-lg z-1 mt-3 w-32 p-2 shadow gap-1">
                        <li><a><span><SquarePen size={16} /></span>Rename</a></li>
                        <li><a><span><Trash2 size={16} /></span>Remove</a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
export default ChatItemHistory;
import { useState, useEffect, useRef } from 'react';
import { EllipsisVertical, Trash2, SquarePen } from 'lucide-react';
import Portal from '../ui/Portal';
import Button from './Buttons';

interface ChatItemProps {
    id: string;
    title: string,
    isActive: boolean;
    onClick: ()=> void;
    onDelete: (id:string)=> void;
}

const ChatItemHistory = ({id, title, isActive, onClick, onDelete}:ChatItemProps)=>{
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState<React.CSSProperties>({ top: 0, left: 0 });
    const menuButtonRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLUListElement>(null);
    const deleteChatRef = useRef<HTMLDialogElement>(null);

    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (menuButtonRef.current) {
            const rect = menuButtonRef.current.getBoundingClientRect();
            const menuHeight = 55;
            const isNearBottom = (rect.bottom + menuHeight) > window.innerHeight;
            setMenuPosition({
                position: 'absolute',
                left: rect.right + 16, 
                top: isNearBottom ? (rect.top - menuHeight) : rect.top,
            });
        }
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if ( isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node) ) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleRemoveChat = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!id) {
            console.error("Attempted to call onDelete but ID is invalid:", id);
            return;
        }
        setIsMenuOpen(false);
        onDelete(id);
        deleteChatRef.current?.close();
    };

    const handleOpenDeleteModal = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteChatRef.current?.showModal();
    }

    const handleCancelRemoveChat = (e: React.MouseEvent) => {
        e.preventDefault();
        deleteChatRef.current?.close();
    }

    return (
        <>
        <div className="flex flex-col">
            <div role="button" onClick={onClick} className={`flex items-center justify-between btn btn-ghost rounded-3xl w-full text-sm ${isActive ? 'btn-active' : ''} group font-medium`}>
                <span className="truncate">{title}</span>

                <div ref={menuButtonRef} role="button" onClick={toggleMenu} className="rounded-full hover:bg-base-200 p-1 flex
                items-center justify-center invisible group-hover:visible">
                    <EllipsisVertical size={18} />
                </div>

                {isMenuOpen && (
                <Portal>
                    <div className="dropdown-menu-portal" style={menuPosition}>
                        <ul ref={menuRef} tabIndex={0} className="menu bg-base-200 rounded-lg z-[999] w-44 p-2 shadow-lg gap-1">
                            <li><a><span><SquarePen size={16} /></span>Rename</a></li>
                            <li onClick={handleOpenDeleteModal}><a><span><Trash2 size={16} /></span>Delete</a></li>
                        </ul>
                    </div>
                </Portal>
                )}

            </div>
        </div>
        
        {/* Modal for delete chat confirmation */}
        <dialog id="deletChatModal" className="modal" ref={deleteChatRef}>
            <div className="modal-box w-11/12 max-w-md">
                <h3 className="text-md font-bold">Delete Chat?</h3>
                <p className="py-4">Are you sure to delete this chat?</p>
                <div className="modal-action">
                <form method="dialog">
                    <div className="flex flex-row gap-2">
                        <Button label="Cancel" onClick={handleCancelRemoveChat} />
                        <Button label="OK" className="btn btn-error w-20" type="submit" onClick={handleRemoveChat}>OK</Button>
                    </div>
                </form>
                </div>
            </div>
        </dialog>

        </>
    );
};
export default ChatItemHistory;
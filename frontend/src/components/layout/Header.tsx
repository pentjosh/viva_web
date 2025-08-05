import { PanelRightClose, SunMoon, Bolt, BookOpen, LogOut, Sun } from 'lucide-react';
import AvatarDefault from '../../assets/img/avatar_default.png';
import useLogo from '../hooks/useLogo';
import useTheme from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';
import ModalLogout from '../ui/ModalLogout';
import ModalFiles from '../ui/ModalFiles';

interface HeaderProps {
    isSideBarOpen: boolean;
    onToggle: () => void;
}

const Header = ({isSideBarOpen, onToggle}:HeaderProps) => {
    const logo = useLogo();
    const { theme, toggleTheme } = useTheme();
    const { logout } = useAuth();
    const [isModalLogoutOpen,setIsModalLogoutOpen] = useState(false);
    const [isModalFilesOpen,setIsModalFilesOpen] = useState(false);

    const handleLogout = ()=>{
        logout();
    };

    return(
    <>
        <header className="flex items-center justify-between bg-transparent h-16 p-3">
            <div className="flex items-center gap-10 overflow-hidden">
                <div className="flex items-center">
                    {!isSideBarOpen && 
                    (<div className="flex">
                        <div onClick={onToggle} className="btn btn-ghost focus:outline-none w-10 p-1 rounded-lg">
                            <PanelRightClose />
                        </div>
                        <div className="flex px-2">
                            <img className="w-32 md:w-32 lg:w-32 object-contain" src={logo} />
                        </div>
                    </div>)}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex">
                    <button className="btn btn-ghost btn-circle">
                        { theme === 'red-dark' ? <Sun onClick={ toggleTheme } size={24} /> : 
                        <SunMoon onClick={ toggleTheme } size={24} /> }
                    </button>
                </div>
                <div className="flex">
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                            <div className="w-10 p-1 rounded-full">
                                <img src={AvatarDefault} />
                            </div>
                        </div>
                        <ul tabIndex={0} className="menu dropdown-content bg-base-200 rounded-lg z-1 mt-3 w-52 p-2 shadow">
                            <li onClick={()=>setIsModalFilesOpen(true)}><a><span><BookOpen size={16} /></span>My Files</a></li>
                            <li><a><span><Bolt size={16} /></span>Settings</a></li>
                            <li onClick={()=>setIsModalLogoutOpen(true)}><a><span><LogOut size={16} /></span>Logout</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>
        
        <ModalLogout isOpen={isModalLogoutOpen} onClose={()=>setIsModalLogoutOpen(false)} onConfirm={handleLogout} />
        <ModalFiles isOpen={isModalFilesOpen} onClose={()=>setIsModalFilesOpen(false)} />
    </>
    )
}

export default Header;
import { PanelRightClose, SunMoon, Bolt, Package, LogOut, Sun } from 'lucide-react';
import AvatarDefault from '../../assets/img/avatar_default.png';
import useLogo from '../hooks/useLogo';
import useTheme from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useRef } from 'react';
import Button from './../ui/Buttons'

interface HeaderProps {
    isSideBarOpen: boolean;
    onToggle: () => void;
}

const Header = ({isSideBarOpen, onToggle}:HeaderProps) => {
    const logo = useLogo();
    const { theme, toggleTheme } = useTheme();
    const { logout } = useAuth();
    const logoutModalRef = useRef<HTMLDialogElement>(null);

    const handleLogout = ()=>{
        logoutModalRef.current?.close();
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
                            <li><a><span><Bolt size={16} /></span>Settings</a></li>
                            <li><a><span><Package size={16} /></span>Archived Chats</a></li>
                            <li onClick={()=>logoutModalRef.current?.showModal()}><a><span><LogOut size={16} /></span>Logout</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </header>

        {/* Modal for logout confirmation */}
        <dialog id="logoutModal" className="modal" ref={logoutModalRef}>
            <div className="modal-box w-11/12 max-w-md">
                <h3 className="text-md font-bold">Logout?</h3>
                <p className="py-4">Are you sure to logout?</p>
                <div className="modal-action">
                <form method="dialog">
                    <div className="flex flex-row gap-2">
                        <Button label="Cancel" />
                        <Button label="OK" className="w-20" type="submit" onClick={handleLogout} />
                    </div>
                </form>
                </div>
            </div>
        </dialog>
    </>
    )
}

export default Header;
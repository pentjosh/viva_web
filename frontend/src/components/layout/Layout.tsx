import React from 'react';
import Sidebar from '../layout/Sidebar';
import Header from './Header';

interface LayoutDefaultProps {
    children: React.ReactNode;
}

const Layout = ({ children } : LayoutDefaultProps) => {
    const [isOpen, setIsOpen] = React.useState(true);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    }

    return (
    <>
    <div className="flex h-screen w-screen overflow-x-hidden">
        <Sidebar isSideBarOpen={isOpen} onToggle={toggleSidebar} />
        <div className="flex flex-1 flex-col overflow-hidden">
            <Header isSideBarOpen={isOpen} onToggle={toggleSidebar} />
            <main className="flex-1 overflow-hidden p-4">
                {children}
            </main>
        </div>
    </div>
    <div className="toast toast-top toast-center z-[9999]" id="toast-root"></div>
    </>
    );
};

export default Layout;
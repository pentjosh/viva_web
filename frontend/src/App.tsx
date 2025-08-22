
import { AuthContextProvider } from './context/AuthContextProvider';
import { ChatContextProvider } from './context/ChatContextProvider';
import { Outlet } from 'react-router-dom';
import { ToastContainer, Slide } from 'react-toastify';
import './App.css';

export default function App() {
  return (
      <>
        <AuthContextProvider>
          <ChatContextProvider>
            <Outlet />
          </ChatContextProvider>
        </AuthContextProvider>
        <ToastContainer autoClose={1000} pauseOnHover={false} transition={Slide} position="top-center"
          style={{ fontSize: '14px' }} />
      </>
  )
}

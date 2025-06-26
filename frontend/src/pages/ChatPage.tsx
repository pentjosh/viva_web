import { useRef, useEffect} from 'react';
import Layout from '../components/layout/Layout';
import { toast } from 'react-toastify';
import { useAuth } from '../components/hooks/useAuth';
import { useChat } from '../components/hooks/useChat';
import { ChatInput } from '../components/ui/ChatInput';
import { ChatHistory } from '../components/ui/ChatHistory';

const ChatPage = () => {
    const { loginSuccess, clearLoginSuccess } = useAuth();
    const toastShownRef = useRef(false);
    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    const { chatList, isTyping, streamedMessage, sendMessage } = useChat();

    useEffect(()=>{
        if(loginSuccess && !toastShownRef.current){
            toast.success("Login successed!");
            toastShownRef.current = true;
            clearLoginSuccess();
        }
    },[loginSuccess, clearLoginSuccess]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatList, streamedMessage]);
 
    return (
        <Layout>
            <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
                <ChatHistory ref={chatContainerRef} chatList={chatList} isTyping={isTyping} streamedMessage={streamedMessage}/>
                <ChatInput onSend={sendMessage} isSending={isTyping} />
            </div>
            
        </Layout>
    );
};

export default ChatPage;



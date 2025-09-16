import { useRef, useEffect} from 'react';
import Layout from '../components/layout/Layout';
import { toast } from 'react-toastify';
import { useAuth } from '../components/hooks/useAuth';
import { useChat } from '../components/hooks/useChat';
import { ChatInput } from '../components/ui/ChatInput';
import { ChatHistory } from '../components/ui/ChatHistory';
import ChatTypeSelection from '../components/ui/ChatTypeSelection';

const ChatPage = () => {
    const { loginSuccess, clearLoginSuccess } = useAuth();
    const toastShownRef = useRef(false);
    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    const { chatList, isTyping, streamedMessage, sendMessage, chatID, chatType, setChatType } = useChat();

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

    const isChatTypeSelectionShouldHide = chatID !== null || chatList.length > 0;
 
    return (
        <Layout>
            <div className="relative shrink flex flex-col h-full max-w-4xl mx-auto w-full">
                {!isChatTypeSelectionShouldHide && (<ChatTypeSelection value = {chatType} onChange={setChatType} />)}
                {/* <div className="h-10" /> */}
                <ChatHistory ref={chatContainerRef} chatList={chatList} isTyping={isTyping} streamedMessage={streamedMessage}/>
                <ChatInput onSend={sendMessage} isSending={isTyping} />
            </div>
        </Layout>
    );
};

export default ChatPage;



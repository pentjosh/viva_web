import React, { useState, useRef, useEffect} from 'react';
import Layout from '../components/layout/Layout';
import { toast } from 'react-toastify';
import { Send, Mic, Square } from 'lucide-react';
import { UserChatBubble } from '../components/ui/UserChatBubble'
import { BotChatBubble } from '../components/ui/BotChatBubble';
import { BotThinking } from '../components/ui/BotThinking';
import { Greetings } from '../components/ui/Greetings';
import { useAuth } from '../components/hooks/useAuth';
import useAutosizeTextArea from '../components/hooks/useAutoSizeTextArea';
import ChatAPI from '../api/ChatAPI';
import { useAudioRecorder } from '../components/hooks/useAudioRecord';

type Chat = { role: 'user' | 'system', message: string };

const FormChat = () => {
    const { loginSuccess, clearLoginSuccess } = useAuth();
    const toastShownRef = useRef(false);
    const [input, setInput] = useState('');
    const [chatList, setChatList] = useState<Chat[]>([]);
    const [botTyping, setBotTyping] = useState(false);
    const [botTypedText, setBotTypedText] = useState('');
    const typingInterval = useRef<number | null>(null);
    const chatContainerRef = useRef<HTMLDivElement | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const audioRef = useRef<Blob | null>(null);

    useEffect(()=>{
        if(loginSuccess && !toastShownRef.current){
            toast.success("Login successed!");
            toastShownRef.current = true;
            clearLoginSuccess();
        }
    },[loginSuccess, clearLoginSuccess]);

    // const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const { isRecording, startRecording, stopRecording } = useAudioRecorder((audioBlob) => {
        audioRef.current = audioBlob;
        console.log('Audio recorded:', audioBlob);
        // setPreviewUrl(URL.createObjectURL(audioBlob));
    });

    useAutosizeTextArea({ value: input, textareaRef, minRows: 1 });

    React.useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatList, botTypedText]);

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSend = async () => {
        if (!input.trim() || botTyping) return;
        const userMessage = input.trim();

        setChatList(prev => [...prev, { role: 'user', message: userMessage }]);
        setInput('');
        setBotTyping(true);
        setBotTypedText('');

        try {
            const response = await ChatAPI(userMessage);
            if (response) {
                let i = 0;
                if (typingInterval.current) {
                    clearInterval(typingInterval.current);
                }
                typingInterval.current = setInterval(() => {
                    setBotTypedText(response.slice(0, i + 1));
                    i++;
                    if (i >= response.length) {
                        clearInterval(typingInterval.current!);
                        setBotTyping(false);
                        setChatList(prev => [...prev, { role: 'system', message: response }]);
                        setBotTypedText('');
                    }
                }, 5);
            } else {
                setBotTyping(false);
            }
        } catch (err) {
            setBotTyping(false);
            setChatList(prev => [...prev, { role: 'system', message: String(err) }]);
        }
    };
    
    return (
        <Layout>
            <div className="flex flex-col h-full max-w-4xl mx-auto w-full">
                <div className="flex-1 scroll-hidden p-4 space-y-4 gap-4" ref={chatContainerRef}>
                    {chatList.length === 0 && !botTyping ? (
                        <Greetings />
                    ) : (
                        <>
                            <div className="flex flex-col space-y-2">
                                {chatList.map((item, idx) =>
                                    item.role === 'user' ? (
                                        <UserChatBubble key={idx} message={item.message} />
                                    ) : (
                                        <BotChatBubble key={idx} message={item.message} />
                                    )
                                )}
                                {botTyping && ( botTypedText ? (<BotChatBubble message={botTypedText} />) : (<BotThinking />))}
                            </div>
                        </>
                    )}
                    
                </div>
                <div className="flex flex-col mt-3 px-3 sm:px-10 sm:mt-2 w-full">
                    <div className="flex flex-col w-full justify-center bg-base-300 bg-clip-border rounded-[28px] px-5 py-2.5 shadow-md border-1 border-gray-400">
                        <div className="flex w-full">
                            <textarea ref={textareaRef} className="bg-transparent px-0 ring-0 py-2 outline-none flex-grow resize-none max-h-36 min-h-[20px] transition-all duration-75
                            border-0 overflow-y-auto" rows={1} onChange={e => setInput(e.target.value)} value={input} 
                            onKeyDown={handleInputKeyDown} style={{ minHeight: "40px" }} />
                        </div>
                        <div className="flex items-center text-base-content justify-end">
                            <button type="button" className={`btn btn-ghost btn-circle p-1 ${isRecording ? "animate-pulse" : ""}`} onClick={isRecording ? stopRecording : startRecording}>
                                {isRecording ? <Square size={24} /> : <Mic size={24} />}
                            </button>
                            <button onClick={handleSend} type="button" className="btn btn-ghost btn-circle p-1" disabled={botTyping || !input.trim()}>
                                <Send size="24" />
                            </button>
                        </div>
                    </div>
                    <div className="pt-3 text-xs text-center text-base-content">
                        An AI may display inaccurate info, please double-check its responses.
                    </div>
                    {/* {previewUrl && <audio src={previewUrl} controls />} */}
                </div>
            </div>
            
        </Layout>
    );
};

export default FormChat;



import { useRef, useState } from "react";
import { Send, Mic, Square } from 'lucide-react';
import useAutosizeTextArea from '../hooks/useAutoSizeTextArea';
import { useAudioRecorder } from '../hooks/useAudioRecord';

interface ChatInputProps {
    onSend: (message: string)=>void;
    isSending: boolean;
}

export const ChatInput = ({onSend, isSending}:ChatInputProps)=> {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const audioRef = useRef<Blob | null>(null);

    useAutosizeTextArea({ value: input, textareaRef, minRows: 1 });

    const { isRecording, startRecording, stopRecording } = useAudioRecorder((audioBlob) => {
        audioRef.current = audioBlob;
        console.log('Audio recorded:', audioBlob);
        // setPreviewUrl(URL.createObjectURL(audioBlob));
    });

    const handleSend = () => {
        if (input.trim()) {
            onSend(input);
            setInput('');
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
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
                    <button onClick={handleSend} type="button" className="btn btn-ghost btn-circle p-1" disabled={isSending || !input.trim()}>
                        <Send size="24" />
                    </button>
                </div>
            </div>
            <div className="pt-3 text-xs text-center text-base-content">
                An AI may display inaccurate info, please double-check its responses.
            </div>
            {/* {previewUrl && <audio src={previewUrl} controls />} */}
        </div>
    );
};
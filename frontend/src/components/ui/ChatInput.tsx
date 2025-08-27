import { useRef, useState, useEffect } from "react";
import { Send, Mic, Square, Paperclip, X } from 'lucide-react';
import useAutosizeTextArea from '../hooks/useAutoSizeTextArea';
import { useAudioRecorder } from '../hooks/useAudioRecord';
import ModalGetMyFiles from '../ui/ModalGetMyFiles';
import { FileType } from '../../api/files/types';
import { FileIcon, defaultStyles } from "react-file-icon";

interface ChatInputProps {
    onSend: (message: string, file: FileType[])=>void;
    isSending: boolean;
}

export const ChatInput = ({onSend, isSending}:ChatInputProps)=> {
    const [input, setInput] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const audioRef = useRef<Blob | null>(null);
    const [isModalGetMyFilesOpen, setIsModalGetMyFilesOpen] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<FileType[]>([]);

    useAutosizeTextArea({ value: input, textareaRef, minRows: 1 });

    const { isRecording, startRecording, stopRecording } = useAudioRecorder((audioBlob) => {
        audioRef.current = audioBlob;
        console.log('Audio recorded:', audioBlob);
        // setPreviewUrl(URL.createObjectURL(audioBlob));
    });

    const handleSend = () => {
        if (input.trim() || attachedFiles.length > 0) {
            onSend(input, attachedFiles);
            setInput('');
            setAttachedFiles([]);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const getFileDetails = (filename: string) => {
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return { name: filename, extension: '' };
        }
        const name = filename.substring(0, lastDotIndex);
        const extension = filename.substring(lastDotIndex + 1);
        return { name, extension };
    };

    const handleAttachFiles = (filesFromModal: FileType[]) => {
        // setAttachedFiles(prevFiles => {
        //     const existingIds = new Set(prevFiles.map(f => f.id));
        //     const newFiles = filesFromModal.filter(f => !existingIds.has(f.id));
        //     return [...prevFiles, ...newFiles];
        // });
        setAttachedFiles(filesFromModal);
    };

    useEffect(() => {
        console.log(attachedFiles);
    }, [attachedFiles]);

    const handleRemoveFile = (fileid: string) => {
        setAttachedFiles(prev => prev.filter(file => file.id !== fileid));
    };

    return (
        <>
        <div className="flex flex-col mt-3 px-3 sm:px-10 sm:mt-2 w-full">
            <div className="flex flex-col w-full justify-center bg-base-200 rounded-[28px] px-5 py-2.5 shadow-md border-1 border-gray-400 bg-clip-padding">
                { attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-1">
                    { attachedFiles.map((file) => {
                        const { name } = getFileDetails(file.name);
                        return(
                        <div key={file.id} className="tooltip group" data-tip={file.name}>
                            <div className="relative bg-base-100 rounded-lg p-5 flex items-center gap-2 text-sm">
                                <div className="size-6">
                                    <FileIcon color="mistyrose" extension={file.extension} {...defaultStyles[file.extension as keyof typeof defaultStyles]} />
                                </div>
                                <div className="w-[100px] truncate">{name}</div>
                                <button onClick={()=> handleRemoveFile(file.id)} 
                                className="btn btn-ghost btn-circle group-hover:opacity-100 opacity-0 absolute top-0.5 right-0.5 size-auto p-1 transition-opacity duration-200">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                        )
                        })}
                    </div>)}
                <div className="flex w-full">
                    <textarea ref={textareaRef} className="bg-transparent px-0 ring-0 py-2 outline-none flex-grow resize-none max-h-36 min-h-[20px] transition-all duration-75
                    border-0 overflow-y-auto" rows={1} onChange={e => setInput(e.target.value)} value={input} 
                    onKeyDown={handleInputKeyDown} style={{ minHeight: "40px" }} />
                </div>

                <div className="flex items-center text-base-content justify-between">
                    <div className="tooltip tooltip-top" data-tip="Add my files">
                        <button type="button" className="btn btn-ghost btn-circle p-1" onClick={()=>setIsModalGetMyFilesOpen(true)}>
                            <Paperclip size="20" />
                        </button>
                    </div>
                    <div className="flex items-center">
                        { input.trim() ? (<div className="tooltip tooltip-top" data-tip="Send">
                            <button onClick={handleSend} type="button" className="btn btn-ghost btn-circle p-1" disabled={isSending || !input.trim()}>
                                <Send size="20" />
                            </button>
                        </div>) : (
                        <div className="tooltip tooltip-top" data-tip="Dictate">
                            <button type="button" className={`btn btn-ghost btn-circle p-1 ${isRecording ? "animate-pulse" : ""}`} onClick={isRecording ? stopRecording : startRecording}>
                                {isRecording ? <Square size={20} /> : <Mic size={20} />}
                            </button>
                        </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="pt-3 text-xs text-center text-base-content">
                An AI may display inaccurate info, please double-check its responses.
            </div>
            {/* {previewUrl && <audio src={previewUrl} controls />} */}
        </div>
        <ModalGetMyFiles isOpen={isModalGetMyFilesOpen} onClose={()=> setIsModalGetMyFilesOpen(false)} onConfirm={handleAttachFiles} preSelectedFiles={attachedFiles} />
        </>
    );
};
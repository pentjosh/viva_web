import { useEffect, useRef, useState, useCallback } from "react";
import Portal from '../ui/Portal';
import { CircleX, CloudUpload, Search, HardDriveDownload, Loader, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import { FileIcon, defaultStyles } from 'react-file-icon';
import { FileType } from '../../api/files/types';
import { getUserFiles, deleteFileById } from "../../api/files/files";
import { toast } from 'react-toastify';

interface ModalFilesProps {
    isOpen: boolean;
    onClose: () => void;
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const ModalFiles = ({ isOpen, onClose }:ModalFilesProps)=> {
    const modalRef = useRef<HTMLDialogElement>(null);
    const [files, setFiles] = useState<FileType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const deleteFileModalRef = useRef<HTMLDialogElement>(null);
    const [fileIdToDelete, setFileIdToDelete] = useState<string|null>(null);

    const fetchFiles = useCallback(async ()=>{
        setIsLoading(true);
        try {
            const data = await getUserFiles();
            setFiles(data);
            console.log(data)
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log(err);
            }
            setFiles([]);
        } finally {
            setIsLoading(false);
        }
    },[]);


    useEffect(() => {
        if (isOpen) {
            fetchFiles();
        }
    }, [isOpen, fetchFiles]);

    useEffect(() => {
        const modal = modalRef.current;
        if(modal) {
            if(isOpen){
                modal.showModal();
            } else {
                modal.close();
            }
        }
    }, [isOpen]);

    useEffect(() => {
        const dialog = modalRef.current;
        if (dialog) {
            const handleClose = () => onClose();
            dialog.addEventListener('close', handleClose);
            return () => {
                dialog.removeEventListener('close', handleClose);
            };
        }
    }, [onClose]);

    const handleOpenDeleteModal = async(fileId:string)=> {
        setFileIdToDelete(fileId);
        console.log(fileId)
        deleteFileModalRef.current?.showModal();
    }

    const handleDeleteFileConfirm = async()=> {
        if(!fileIdToDelete) return;

        try{
            await deleteFileById(fileIdToDelete);
            await fetchFiles();
        }
        catch(error)
        {
            console.log(error);
            toast.error("Failed to delete file. Please contact Administrator");
        }
        finally{
            setFileIdToDelete(null);
        }
    };

    const fileGrid = ()=>{
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-48">
                    <Loader size={40} className="animate-spin text-base-content/60" />
                </div>
            );
        }

        if (files.length === 0) {
            return(
                <div className="flex items-center justify-center h-48">
                    <p className="text-base-content/70">You don't have any files.</p>
                </div>
            );
        };

        return(
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-6 gap-4">
                {files.map((file) => (
                    <div key={file.id} className="relative flex flex-col items-center p-3 rounded-lg shadow-sm max-w-48 border border-base-300 group">
                        <button onClick={()=>handleOpenDeleteModal(file.id)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-base-200/70 hover:bg-base-300 opacity-0 
							group-hover:opacity-100 transition-opacity z-10 cursor-pointer">
                            <Trash2 size={16} className="text-base-content/60 font-bold"/>
                        </button>
                        
                        <div className="size-10 mb-4">
                            <FileIcon extension={file.type}
                                {...defaultStyles[file.type as keyof typeof defaultStyles]}
                            />
                        </div>
                        <div className="flex items-center justify-between w-full">
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium truncate" title={file.name}>{file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                            <a href="#" className="ml-2 flex-shrink-0 p-1">
                                <HardDriveDownload className="text-gray-500" />
                            </a>
                        </div>
                        {file.status==='Processing' && (
                            <div className="absolute inset-0 bg-base-100/90 flex items-center justify-center rounded-lg">
                                <span className="font-semibold text-sm"><Loader size={40} className="animate-spin text-base-content/60" /></span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };
    
    return(
        <>
        <Portal target="modal-files-portal">
            {isOpen && (
                <dialog className="modal" ref={modalRef}>
                    <div className="modal-box max-w-4xl flex flex-col gap-5 max-h-[90vh]">
                        <div className="flex justify-between">
                            <h1 className="font-bold">My Files</h1>
                            <button className="btn btn-ghost btn-circle">
                                <CircleX size={24} onClick={onClose} />
                            </button>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-between pt-2 gap-4">
                            <div className="input grow w-full max-w-sm">
                                <Search className="opacity-50" size={16} />
                                <input type="text" placeholder="Search files..." />
                            </div>
                            <div className="flex items-center justify-center">
                                <Button><CloudUpload size={20} />Upload</Button>
                            </div>
                        </div>
                        <div className="grow items-center justify-center p-1 mt-4 overflow-y-auto">
                            {fileGrid()}
                        </div>
                    </div>
                </dialog>
            )}
        </Portal>
        <Portal target="modal-file-delete">
            <dialog id="deleteFileModal" className="modal" ref={deleteFileModalRef}>
                <div className="modal-box w-11/12 max-w-md">
                    <h3 className="text-md font-bold">Delete File?</h3>
                    <p className="py-4">Are you sure to delete this file?</p>
                    <div className="modal-action">
                    <form method="dialog">
                        <div className="flex flex-row gap-2">
                            <Button>Cancel</Button>
                            <Button className="btn btn-error w-20" type="submit" onClick={handleDeleteFileConfirm}>OK</Button>
                        </div>
                    </form>
                    </div>
                </div>
            </dialog>
        </Portal>
        </>
    );
};

export default ModalFiles;
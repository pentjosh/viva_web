import { useEffect, useRef, useState, useCallback } from "react";
import Portal from '../ui/Portal';
import Button from '../ui/Button';
import { FileIcon, defaultStyles } from "react-file-icon";
import { FileType } from '../../api/files/types';
import { getUserFilesCompleted } from "../../api/files/files";

interface ModalGetMyFilesProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (selectedFiles: FileType[]) => void;
    preSelectedFiles?: FileType[]
}

const ModalGetMyFiles = ({ isOpen, onClose, onConfirm, preSelectedFiles }: ModalGetMyFilesProps) => {
    const modalRef = useRef<HTMLDialogElement>(null);
    const [files, setFiles] = useState<FileType[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<Map<string, FileType>>(new Map());

    const MAX_FILES = 5;

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

    const handleConfirm = () => {
        onConfirm(Array.from(selectedFiles.values()));
        onClose();
    };

    const fetchFiles = useCallback(async ()=>{
        try {
            const data = await getUserFilesCompleted();
            setFiles(data);
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
            } else {
                console.log(err);
            }
            setFiles([]);
        }
    },[]);

    const getFileDetails = (filename: string) => {
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return { name: filename, extension: '' };
        }
        const name = filename.substring(0, lastDotIndex);
        const extension = filename.substring(lastDotIndex + 1);
        return { name, extension };
    };

    useEffect(() => {
        if(isOpen){
            fetchFiles();
            setSelectedFiles(new Map(
                (preSelectedFiles ?? []).map(file => [file.id, file])
            ));
        }
    }, [isOpen,fetchFiles, preSelectedFiles]);

    const handleSelectedFiles = (file: FileType) =>{
        setSelectedFiles(prevSelected => {
            const newSelection = new Map(prevSelected);
            if (newSelection.has(file.id)) {
                newSelection.delete(file.id);
            } else {
                if(newSelection.size < MAX_FILES){
                    newSelection.set(file.id, file);
                }
            }
            return newSelection;
        });
    }

    return(
    <Portal target="modal-getmyfiles-portal">
        <dialog className="modal" ref={modalRef}>
            <div className="modal-box w-11/12 max-w-lg flex flex-col h-11/12">
                <h3 className="text-lg font-semibold mb-1">My Files</h3>
                <h5 className="text-xs mb-4">You can only pick maximum {MAX_FILES} files! ({selectedFiles.size}/{MAX_FILES})</h5>
                <div className="flex-1 items-center mt-3 overflow-y-auto min-h-0">
                    <ul className="divide-y divide-base-content/10 px-2 w-full">
                        { files.length > 0 ? (
                            files.map((file) => {
                                const { name, extension } = getFileDetails(file.name);
                                return (
                                <li className="p-2 hover:cursor-pointer hover:bg-base-300" key={file.id} onClick={()=>handleSelectedFiles(file)}>
                                    <div className="flex flex-1 items-center">
                                        <input type="checkbox" className="checkbox checkbox-xs" checked={selectedFiles.has(file.id)} readOnly />
                                        <div className="flex p-2 items-center w-full">
                                            <div className="flex items-center p-1">
                                                <div className="size-7">
                                                    <FileIcon color="mistyrose" extension={file.extension} {...defaultStyles[file.extension as keyof typeof defaultStyles]} />
                                                </div>
                                            </div>
                                            <div className="flex flex-1 min-w-0 items-center ps-3 text-sm">
                                                <span className="truncate">
                                                    {name}
                                                </span>
                                                <span className="flex-shrink-0">.{extension}</span>
                                            </div>
                                        </div>
                                    </div>
                                </li>)})
                        ) : (
                            <div className="flex items-center justify-center p-5">
                                <p className="text-base-content/70 text-sm">You don't have any files yet.</p>
                            </div>
                        )}                        
                    </ul>
                </div>


                <div className="modal-action">
                    <form method="dialog">
                        <div className="flex flex-row gap-2">
                            <Button className="w-20" onClick={onClose}>Cancel</Button>
                            <Button className="w-20" onClick={handleConfirm}>OK</Button>
                        </div>
                    </form>
                </div>
            </div>
        </dialog>
    </Portal>
    )
};

export default ModalGetMyFiles;
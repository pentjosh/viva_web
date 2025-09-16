import { useState, useCallback, useEffect, useRef } from "react";
import Layout from "../components/layout/Layout";
import { Search, CloudUpload, EllipsisVertical, ArrowDownToLine, Trash2, RefreshCw, Repeat2, Loader } from "lucide-react";
import Button from "../components/ui/Button";
import { FileIcon, defaultStyles } from "react-file-icon";
import { FileType } from '../api/files/types';
import { getUserFiles, deleteFileById, uploadFile } from "../api/files/files";
import { format } from 'date-fns';
import Portal from '../components/ui/Portal';
import { toast } from 'react-toastify';

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const MyFiles = ()=>{
    const [files, setFiles] = useState<FileType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fileIdToDelete, setFileIdToDelete] = useState<string|null>(null);
    const deleteFileModalRef = useRef<HTMLDialogElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fetchFiles = useCallback(async ()=>{
        setIsLoading(true);
        try {
            const data = await getUserFiles();
            setFiles(data);
            console.log(data);
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
        fetchFiles();
    }, [fetchFiles]);

    const getFileDetails = (filename: string) => {
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1) {
            return { name: filename, extension: '' };
        }
        const name = filename.substring(0, lastDotIndex);
        const extension = filename.substring(lastDotIndex + 1);
        return { name, extension };
    };

    const handleOpenDeleteModal = async(fileId:string)=> {
            setFileIdToDelete(fileId);
            deleteFileModalRef.current?.showModal();
        }
    
    const handleDeleteFileConfirm = async()=> {
        if(!fileIdToDelete) return;
        try{
            await deleteFileById(fileIdToDelete);
            await fetchFiles();
            toast.success("File has been deleted.")
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

    const handleUploadButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            return;
        }

        setIsUploading(true);
        try {
            await uploadFile(selectedFile);
            toast.success(`File uploaded successfully!`);
            await fetchFiles();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("An unknown error occurred during upload.");
            }
        } finally {
            setIsUploading(false);
            if(event.target) {
                event.target.value = '';
            }
        }
    };

    return (
        <>
        <Layout>
            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileChange}/>
            <div className="flex">
                <div className="w-full p-6">
                    <div className="flex flex-col gap-4 mb-5">
                        <div className="flex flex-row items-center gap-3">
                        <h4 className="font-semibold uppercase">My Files</h4>
                        <div onClick={()=> fetchFiles()} role="button" className="p-1 hover:bg-base-300 hover:cursor-pointer rounded-full tooltip tooltip-top" data-tip="Refresh">
                            <RefreshCw className="opacity-50" size={16} /></div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-3">
                            <div className="input grow w-full max-w-sm">
                                <Search className="opacity-50" size={16} />
                                <input type="text" placeholder="Search files..." />
                            </div>
                            <div className="flex items-center justify-center">
                                <Button onClick={handleUploadButtonClick} disabled={isUploading}><CloudUpload size={20}/>Upload</Button>
                            </div>
                        </div>
                    </div>

                    <div className="grow items-center justify-center mt-4 min-h-36">
                        <div className="grid grid-flow-dense grid-cols-12 gap-4">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center h-48 col-span-12">
                                    <Loader size={40} className="animate-spin text-base-content/60" />
                                </div>
                            ) : files.length > 0 ? (
                                files.map((file) => {
                                    const { name, extension } = getFileDetails(file.name);
                                    const formatedUpdateAt = format(new Date(file.updated_at), 'dd-MMM-yyyy hh:mm a');
                                    return (
                                        <div key={file.id} className="relative border border-zinc-400 rounded col-span-12 sm:col-span-6 md:col-span-5 lg:col-span-4 min-w-0">
                                            <div className="absolute top-1 right-1">
                                                <div className="dropdown dropdown-end flex-shrink-0">
                                                    <button tabIndex={0} className="p-1 rounded-full hover:bg-base-300 hover:cursor-pointer">
                                                        <EllipsisVertical className="opacity-60" size={16} />
                                                    </button>
                                                    <ul tabIndex={0} className="menu dropdown-content bg-base-200 rounded-lg z-1 mt-3 w-auto p-2 shadow">
                                                        { file.status === "Failed" && (<li><a><span><Repeat2 size={16} /></span>Reprocess</a></li>) }
                                                        { file.status === "Completed" && (<li><a><span><ArrowDownToLine size={16} /></span>Download</a></li>) }
                                                        <li><a onClick={() => handleOpenDeleteModal(file.id)}><span><Trash2 size={16} /></span>Delete</a></li>
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="flex p-6">
                                                <div className="flex items-center p-1">
                                                    <div className="size-10 flex-shrink-0">
                                                        <FileIcon color="mistyrose" extension={file.extension} {...defaultStyles[file.extension as keyof typeof defaultStyles]}/>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <div className="relative text-sm font-semibold ps-3 inline-flex text-base-content/90 truncate">
                                                        <span className="truncate">{name}</span>
                                                        <span className="flex-shrink-0">.{extension}</span>
                                                    </div>
                                                    <div className="flex flex-col ps-3 text-xs text-slate-500 font-medium">
                                                        <span>{formatFileSize(file.size)}</span>
                                                        { file.status === "Processing" && (<span>Processing</span>) }
                                                        { file.status === "Failed" && (<span className="text-red-600">{file.status}</span>) }
                                                        { file.status === "Completed" && (<span>Last modified : {formatedUpdateAt} </span>) }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="flex items-center justify-center h-48 col-span-12">
                                    <p className="text-base-content/70">You don't have any files yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

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
        </Layout>
        </>
    );
};

export default MyFiles;
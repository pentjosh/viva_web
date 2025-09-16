import { FileType } from './types';
import { BASE_URL } from '../base';

export const getUserFiles = async(): Promise<FileType[]> => {
    const response = await fetch(`${BASE_URL}/api/files`,{
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store'
    });

    if(!response.ok)
    {
        const data = await response.json();
        throw new Error(data.detail);
    }
    const files: FileType[] = await response.json();
    return files;
}

export const getUserFilesCompleted = async(): Promise<FileType[]> => {
    const response = await fetch(`${BASE_URL}/api/files/completed`,{
        method: "GET",
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store'
    });

    if(!response.ok)
    {
        const data = await response.json();
        throw new Error(data.detail);
    }
    const files: FileType[] = await response.json();
    return files;
}

export const deleteFileById = async(file_id:string): Promise<boolean>=> {
    try{
        const response = await fetch(`${BASE_URL}/api/files/delete/${file_id}`,{
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        });
        if(!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Network response was not ok');
        }
        return true;
    }
    catch(error){
        console.log("Error deleting file : ", error);
        throw error;
    }
}

export const uploadFile = async (file: File): Promise<FileType> => {
    const formData = new FormData();
    formData.append('file', file);
    try{
        const response = await fetch(`${BASE_URL}/api/files/upload`,{
            method: 'POST',
            credentials: 'include',
            body: formData,
            cache: 'no-store'
        });
        if(!response.ok)
        {
            const data = await response.json();
            throw new Error(data.detail);
        }

        const files: FileType = await response.json();
        return files;
    }
    catch(error){
        console.log("Error upload file : ", error);
        throw error;
    }
}
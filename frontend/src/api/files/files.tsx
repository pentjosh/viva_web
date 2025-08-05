import { FileType } from './types';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const getUserFiles = async(): Promise<FileType[]> => {
    const response = await fetch(`${baseUrl}/api/files`,{
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
        const response = await fetch(`${baseUrl}/api/files/delete/${file_id}`,{
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
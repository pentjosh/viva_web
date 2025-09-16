import { BASE_URL } from '../base';
import { SigninRequest, UserSession } from './types';

export const signIn = async (request: SigninRequest): Promise<UserSession> => {
    const response = await fetch(`${BASE_URL}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(request)
    });

    if(!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Failed to sign in. Please check your credentials.');
    }

    return await response.json();
}

export const signOut = async (): Promise<void> => {
    await fetch(`${BASE_URL}/api/auth/signout`, {
        method: "POST",
        credentials: "include"
    });
};

export const getSession = async (): Promise<UserSession | null> => {
    const response = await fetch(`${BASE_URL}/api/auth`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
    });
    if(!response.ok) {
        // if(response.status === 401 || response.status === 404) {
        //     return null;
        // }
        throw new Error('Failed to fetch session.');
    }

    return await response.json();
}

export const refreshToken = async (): Promise<void> => {
    const response = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
    });
    
    if(!response.ok) {
        throw new Error('Failed to refresh token.');
    }
}
export interface SigninRequest {
    email: string;
    password: string;
}

export interface UserSession {
    access_token: string;
    token_type: string;
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: number;
    profile_image_url?: string;
    last_active_at?: string;
    updated_at?: string;
    created_at?: string;
}
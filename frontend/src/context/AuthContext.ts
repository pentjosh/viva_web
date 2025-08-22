import { createContext } from "react";
import { UserSession } from "../api/auths/types";

export interface AuthContextType {
    user: UserSession | null;
    login: (email:string,password:string) => Promise<void>;
    logout: () => void;
    isLoggedIn: ()=> boolean;
    loginSuccess: boolean;
    clearLoginSuccess: ()=> void;
}

export const AuthContext = createContext<AuthContextType|undefined>(undefined);
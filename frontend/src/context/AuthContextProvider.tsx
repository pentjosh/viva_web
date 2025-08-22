import { ReactNode, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { signIn, getSession, signOut } from '../api/auths/auths';
import { UserSession } from '../api/auths/types';
import { useAppNavigate  } from '../components/hooks/useAppNavigate';

interface AuthContextProviderProps {
    children: ReactNode;
}

export const AuthContextProvider = ({children}:AuthContextProviderProps) => {
    const navigate = useNavigate();
    const { replace } = useAppNavigate();
    const [user, setUser] = useState<UserSession|null>(null);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const fetchSession = async () => {
            try{
            const session = await getSession();
                if (session) {
                    setUser(session);
                    navigate("/");
                } else {
                    navigate("/login");
                }
            }
            catch(err){
                setUser(null);
                navigate("/login");
                console.log(err);
            }
            finally{
                setIsReady(true);
            }
        };
        fetchSession();
    }, [navigate]);

    const login = async(email:string, password:string) =>{
        const session = await signIn({email, password});
        if(session){
            setUser(session);
            replace("/");
            setLoginSuccess(true);
        }
    };

    const logout = ()=> {
        setUser(null);
        replace("/login");
        signOut();
    };

    const isLoggedIn = () =>{
        return !!user;
    }

    const clearLoginSuccess = () => {
        setLoginSuccess(false);
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoggedIn, loginSuccess, clearLoginSuccess }}>
            {isReady ? children : null}
        </AuthContext.Provider>
    )
};
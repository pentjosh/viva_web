import InputText from '../components/ui/InputText';
import Button from '../components/ui/Buttons';
const currYear = new Date().getFullYear();
import { useAuth } from '../components/hooks/useAuth';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAppNavigate } from '../components/hooks/useAppNavigate';
import CIMBLogo from '../assets/img/CIMB_Niaga_logo.svg';

const LoginPage = () => {
    const { login, isLoggedIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { replace } = useAppNavigate();

    useEffect(()=>{
        if(isLoggedIn()){
            replace("/");
        }
    },[isLoggedIn, replace]);

    const handleLogin = async (e:FormEvent)=> {
        e.preventDefault();
        if(email && password){
            try{
            await login(email, password);
            }
            catch(error){
                toast.error("Invalid username or password.");
                console.log(error);
            }
        }
        else{
            toast.error("Email and password cannot be empty.")
        }
    };
    
    return (
        <>
        <div data-theme="red-light">
        <div className="absolute top-0 left-0 p-6">
            <img className="w-32 md:w-32 lg:w-32 object-contain" src={CIMBLogo} />
        </div>
        <div className="min-h-screen flex flex-col justify-center items-center">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-orange-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 rounded-xl">
                </div>
                <div className="relative px-4 py-10 shadow-lg rounded-xl sm:p-10 bg-base-100">
                    <form onSubmit={handleLogin}>
                        <div className="max-w-sm mx-auto">
                            <div>
                                <h1 className="text-2xl font-semibold">Login</h1>
                            </div>
                            <div className="py-8 text-base leading-6 space-y-4 sm:text-lg sm:leading-7 w-75">
                                <div className="relative">
                                    <InputText id="email" label="Email" type="text" value={email} onChange={(e)=>setEmail(e.target.value)} />
                                </div>
                                <div className="relative">
                                    <InputText id="password" label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
                                </div>
                                <div className="relative">
                                    <Button label="Login" className="w-20" type="submit" />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <div className="absolute bottom-2 text-sm text-gray-500">
                Copyright &copy; {currYear} Corporate Assurance CIMB Niaga.
            </div>

        </div>
        </div>
        </>
    )
}

export default LoginPage;
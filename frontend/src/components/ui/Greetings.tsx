import { useAuth } from '../hooks/useAuth';

export const Greetings = () => {
    const { user } = useAuth();

    return (
        <div className="flex flex-col gap-3 w-full items-center justify-center md:max-w-full">
            <p className="bg-gradient-to-r from-blue-500 to-red-500 inline-block text-transparent bg-clip-text text-3xl font-medium">
                Hello, {user?.first_name}.
            </p>
            <p className="text-sm text-base-content">Tell me what you think. How can I help?</p>
        </div>
    )
};

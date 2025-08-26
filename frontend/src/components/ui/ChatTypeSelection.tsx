

interface ChatTypeSelectionProps {
    isDisabled: boolean;
    // value: string;
    // onChange: (value:string) => void
}

const ChatTypeSelection = ({ isDisabled }:ChatTypeSelectionProps) => {
    // const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    //     onChange(e.target.value);
    //     console.log(e.target.value);
    // }

    return (
        <>
        <div className="absolute top-0 left-0">
            <div className="flex items-center gap-2">
                <select className="select select-sm" disabled={isDisabled}>
                    <option value="general">General Task</option>
                    <option value="audit">Audit Knowledge</option>
                </select>
            </div>
        </div>
        </>
    )
};

export default ChatTypeSelection;
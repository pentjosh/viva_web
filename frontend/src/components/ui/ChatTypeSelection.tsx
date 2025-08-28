

interface ChatTypeSelectionProps {
    value: string;
    onChange: (value:string) => void
}

const ChatTypeSelection = ({ value, onChange }:ChatTypeSelectionProps) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value);
        console.log(e.target.value);
    };

    return (
        <>
        <div className="absolute top-0 left-0">
            <div className="flex items-center gap-2">
                <select className="select select-sm" value={value} onChange={handleChange}>
                    <option value="general">General Task</option>
                    <option value="audit">Audit Knowledge</option>
                </select>
            </div>
        </div>
        </>
    )
};

export default ChatTypeSelection;
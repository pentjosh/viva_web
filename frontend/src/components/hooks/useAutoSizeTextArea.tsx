import { useEffect } from "react";

interface UseAutosizeTextAreaProps {
    value: string;
    textareaRef: React.RefObject<HTMLTextAreaElement|null>;
    minRows?: number;
}

const useAutosizeTextArea = ({ value, textareaRef, minRows=1}:UseAutosizeTextAreaProps) => {
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.rows = minRows;
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        }
    }, [value, textareaRef, minRows]);
};

export default useAutosizeTextArea;
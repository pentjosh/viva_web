import { useRef, useState } from "react";

export function useAudioRecorder(onStop: (audioBlob: Blob) => void) {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        if (!navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder === "undefined") {
            alert("Your browser does not support audio recording.");
            return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        chunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
            onStop(audioBlob);
            stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        };

        mediaRecorder.start();
        setIsRecording(true);
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
    };

    return { isRecording, startRecording, stopRecording };
}

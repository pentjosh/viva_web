import { useEffect, useRef } from "react";
import Portal from '../ui/Portal';
import Button from './Button';

interface ModalLogoutProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const ModalLogout = ({ isOpen, onClose, onConfirm }: ModalLogoutProps) => {
    const modalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const modal = modalRef.current;

        if(modal) {
            if(isOpen){
                modal.showModal();
            } else {
                modal.close();
            }
        }
    }, [isOpen]);

    useEffect(() => {
        const dialog = modalRef.current;
        if (dialog) {
            const handleClose = () => onClose();
            dialog.addEventListener('close', handleClose);
            return () => {
                dialog.removeEventListener('close', handleClose);
            };
        }
    }, [onClose]);

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <Portal target="modal-logout-portal">
            <dialog className="modal" ref={modalRef}>
                <div className="modal-box w-11/12 max-w-md">
                    <h3 className="text-md font-bold">Logout?</h3>
                    <p className="py-4">Are you sure to logout?</p>
                    <div className="modal-action">
                        <form method="dialog">
                            <div className="flex flex-row gap-2">
                                <Button className="w-20" onClick={onClose}>Cancel</Button>
                                <Button className="w-20" onClick={handleConfirm}>OK</Button>
                            </div>
                        </form>
                    </div>
                </div>
            </dialog>
        </Portal>
    );
};

export default ModalLogout;
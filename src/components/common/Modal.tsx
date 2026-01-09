import { FiX } from "react-icons/fi";

interface ModalProps {
  children: React.ReactNode;
  onClose?: () => void;
}

const Modal = ({ children, onClose }: ModalProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-card w-full max-w-md rounded-lg border border-border shadow-lg animate-in zoom-in-95 duration-200">
        {onClose && (
            <button 
                onClick={onClose}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors p-1"
            >
                <FiX size={18} />
            </button>
        )}
        <div className="max-h-[90vh] overflow-y-auto">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;

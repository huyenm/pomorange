import { useEffect } from "react";

interface ConfettiModalProps {
  isOpen: boolean;
  taskName: string;
  onClose: () => void;
}

export function ConfettiModal({ isOpen, taskName, onClose }: ConfettiModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Auto close after 2 seconds and proceed to next flow
      const timer = setTimeout(() => {
        onClose();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="text-center">
        {/* Celebration Video */}
        <video 
          src="/confetti.webm"
          autoPlay
          muted
          loop
          className="w-64 h-48 mx-auto object-cover"
        />
      </div>
    </div>
  );
}
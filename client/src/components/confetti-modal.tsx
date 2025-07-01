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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/20">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Full Screen Confetti Video */}
        <video 
          src="/confetti.webm"
          autoPlay
          muted
          onEnded={onClose}
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Overlay Content */}
        <div className="relative z-10 text-center bg-white/95 backdrop-blur-sm rounded-lg p-8 shadow-xl max-w-sm mx-4">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2" style={{ fontFamily: 'Space Mono, monospace' }}>
            Task Completed!
          </h2>
          <p className="text-gray-700 mb-4">
            Great job finishing "<span className="font-semibold">{taskName}</span>"
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
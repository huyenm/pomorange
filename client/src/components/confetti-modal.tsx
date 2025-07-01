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
    <div className="fixed inset-0 z-[9999] bg-black/80">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Modal-sized container to match Time's Up modal */}
        <div className="relative max-w-md w-full mx-4">
          <video 
            src="/confetti.webm"
            autoPlay
            muted
            onEnded={onClose}
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
          />
          
          {/* Content overlay matching modal size */}
          <div className="relative bg-white/95 backdrop-blur-sm rounded-lg p-8 shadow-xl min-h-[200px] flex flex-col items-center justify-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-600 mb-3" style={{ fontFamily: 'Space Mono, monospace' }}>
              Task Completed!
            </h2>
            <p className="text-gray-700 mb-6 text-center">
              Great job finishing "<span className="font-semibold">{taskName}</span>"
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              style={{ fontFamily: 'Space Mono, monospace' }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
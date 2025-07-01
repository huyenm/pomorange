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
    <div className="fixed inset-0 z-[9999] bg-black/40">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Centered Confetti Video */}
        <div className="relative">
          <video 
            src="/confetti.webm"
            autoPlay
            muted
            onEnded={onClose}
            className="w-96 h-72 rounded-lg shadow-2xl"
          />
          
          {/* Overlay Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-white/95 backdrop-blur-sm rounded-lg p-6 shadow-xl max-w-xs">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-xl font-bold text-green-600 mb-2" style={{ fontFamily: 'Space Mono, monospace' }}>
                Task Completed!
              </h2>
              <p className="text-gray-700 text-sm mb-4">
                Great job finishing "<span className="font-semibold">{taskName}</span>"
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                style={{ fontFamily: 'Space Mono, monospace' }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
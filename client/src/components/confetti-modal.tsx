import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

interface ConfettiModalProps {
  isOpen: boolean;
  taskName: string;
  onClose: () => void;
}

export function ConfettiModal({ isOpen, taskName, onClose }: ConfettiModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Auto close after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center border-none bg-gradient-to-b from-yellow-50 to-orange-50">
        <div className="py-8">
          {/* Celebration Icon */}
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Trophy className="h-10 w-10 text-yellow-600" />
          </div>
          
          {/* Celebration GIF */}
          <div className="mb-6">
            <img 
              src="https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif"
              alt="Celebration confetti"
              className="w-32 h-32 mx-auto rounded-lg"
            />
          </div>
          
          {/* Success Message */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Space Mono, monospace' }}>
            🎉 Task Completed!
          </h2>
          
          <p className="text-lg text-gray-600 mb-6">
            Great job completing: <span className="font-semibold" style={{ fontFamily: 'Space Mono, monospace' }}>"{taskName}"</span>
          </p>
          
          <Button 
            onClick={onClose}
            className="btn-primary px-8 py-2"
            style={{ fontFamily: 'Space Mono, monospace' }}
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
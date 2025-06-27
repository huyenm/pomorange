import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle, X } from "lucide-react";

interface TaskCompletionModalProps {
  isOpen: boolean;
  taskName: string;
  onCompleted: () => void;
  onNotCompleted: () => void;
}

export function TaskCompletionModal({ 
  isOpen, 
  taskName, 
  onCompleted, 
  onNotCompleted 
}: TaskCompletionModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md" hideCloseButton={true}>
        <DialogHeader>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-semibold mb-2">Time's Up!</DialogTitle>
            <DialogDescription className="text-slate-600">
              Have you finished the task "<span style={{ fontFamily: 'Space Mono, monospace' }}>{taskName}</span>"?
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="flex space-x-4 mt-6">
          <Button
            variant="outline"
            onClick={onNotCompleted}
            className="flex-1 btn-secondary"
          >
            <X className="mr-2 h-4 w-4" />
            No, Continue
          </Button>
          <Button
            onClick={onCompleted}
            className="flex-1 btn-primary"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Yes, Completed
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

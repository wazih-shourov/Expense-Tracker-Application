import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';
import { useSocialFeed } from '@/hooks/useSocialFeed';
import { toast } from 'sonner';

interface CreatePollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreatePollDialog = ({ open, onOpenChange }: CreatePollDialogProps) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const { createPoll, isLoading } = useSocialFeed();

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    const filledOptions = options.filter((opt) => opt.trim());
    if (filledOptions.length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    await createPoll(question, filledOptions);
    setQuestion('');
    setOptions(['', '']);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create a Poll</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="question">Question</Label>
            <Textarea
              id="question"
              placeholder="Ask a question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>Options</Label>
            <div className="space-y-2 mt-1.5">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                  {options.length > 2 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveOption(index)}
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="mt-2 gap-2"
              >
                <Plus size={16} />
                Add Option
              </Button>
            )}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full"
          >
            Create Poll
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePollDialog;

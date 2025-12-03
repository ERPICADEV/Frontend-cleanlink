import { useState, useRef } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type ProgressStatus = 'not_started' | 'in_progress' | 'submitted_for_approval';

interface UpdateProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportId: string;
  currentStatus?: ProgressStatus;
  onSubmit: (data: {
    progress_status?: ProgressStatus;
    notes?: string;
    photos?: File[];
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export function UpdateProgressModal({
  open,
  onOpenChange,
  reportId,
  currentStatus = 'not_started',
  onSubmit,
  isSubmitting = false,
}: UpdateProgressModalProps) {
  const [status, setStatus] = useState<ProgressStatus>(currentStatus);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const statusOptions = [
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'submitted_for_approval', label: 'Submit for Approval' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Filter out non-image files
      const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length !== newFiles.length) {
        toast({
          title: 'Invalid file type',
          description: 'Only image files are allowed.',
          variant: 'destructive',
        });
      }
      
      setPhotos(prev => [...prev, ...imageFiles].slice(0, 5)); // Limit to 5 photos
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedNotes = notes.trim();

    // Backend requires completion_details >= 20 characters when submitting for approval
    if (status === "submitted_for_approval" && trimmedNotes.length < 20) {
      toast({
        title: "More details needed",
        description: "Please provide at least 20 characters describing the completed work before submitting for approval.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress (in a real app, this would be handled by your file upload service)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);
      
      await onSubmit({
        progress_status: status,
        notes: trimmedNotes || undefined,
        photos: photos.length > 0 ? photos : undefined,
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset form
      setStatus('not_started');
      setNotes('');
      setPhotos([]);
      onOpenChange(false);
      
      toast({
        title: 'Progress updated',
        description: 'The report progress has been updated successfully.',
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update progress. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Report Progress</DialogTitle>
          <DialogDescription>
            Update the status and add notes about the progress on report #{reportId.slice(0, 8)}...
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProgressStatus)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting || isUploading}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about the progress..."
                className="min-h-[100px]"
                disabled={isSubmitting || isUploading}
              />
              <p className="text-xs text-muted-foreground">
                {notes.length}/1000 characters
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Photos (Optional)</Label>
              <div className="flex flex-wrap gap-4">
                {photos.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Progress photo ${index + 1}`}
                      className="h-24 w-24 rounded-md object-cover border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isSubmitting || isUploading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                
                {photos.length < 5 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`h-24 w-24 rounded-md border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isSubmitting || isUploading}
                    />
                    <div className="text-center p-2">
                      <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Add Photo
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {photos.length}/5 photos (max 5MB each)
              </p>
            </div>
            
            {isUploading && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading {uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Updating...'}
                </>
              ) : (
                'Update Progress'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

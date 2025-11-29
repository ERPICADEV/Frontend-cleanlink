import { useState } from "react";
import { CheckCircle, ArrowLeft, ArrowRight, Loader2, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import type { Report, ReportStatus } from "@/types/admin";
import { cn } from "@/lib/utils";

interface ResolveReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report | null;
  onResolve: (reportId: string, status: ReportStatus, details: string, duplicateId?: string) => void | Promise<void>;
  isLoading?: boolean;
}

type ResolutionStatus = "resolved" | "invalid" | "duplicate" | "cannot_fix";

const resolutionOptions: { value: ResolutionStatus; label: string; description: string }[] = [
  { value: "resolved", label: "Resolved", description: "Issue was successfully fixed" },
  { value: "cannot_fix", label: "Cannot Fix", description: "Out of scope or not actionable" },
  { value: "duplicate", label: "Duplicate", description: "Duplicates another report" },
  { value: "invalid", label: "Invalid", description: "False or spam report" },
];

export function ResolveReportModal({
  open,
  onOpenChange,
  report,
  onResolve,
  isLoading: externalLoading = false,
}: ResolveReportModalProps) {
  const [step, setStep] = useState(1);
  const [resolutionStatus, setResolutionStatus] = useState<ResolutionStatus | "">("");
  const [details, setDetails] = useState("");
  const [duplicateId, setDuplicateId] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isLoading = externalLoading;

  const maxDetails = 2000;
  const minDetails = 20;

  const validateStep1 = () => {
    if (!resolutionStatus) {
      setErrors({ status: "Please select a resolution status" });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (details.length < minDetails) {
      newErrors.details = `Please provide at least ${minDetails} characters`;
    }

    if (resolutionStatus === "duplicate" && !duplicateId) {
      newErrors.duplicate = "Please enter the duplicate report ID";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep2() || !report) return;

    const finalStatus: ReportStatus = (resolutionStatus === "cannot_fix" ? "invalid" : resolutionStatus) as ReportStatus;
    
    // For now, use a placeholder image URL since backend requires cleaned_image_url
    // In production, this should come from actual image upload
    const imageUrl = photos.length > 0 ? photos[0] : "https://placeholder.com/after.jpg";
    
    await onResolve(report.id, finalStatus, details, resolutionStatus === "duplicate" ? duplicateId : undefined);
    handleClose();
  };

  const handleClose = () => {
    setStep(1);
    setResolutionStatus("");
    setDetails("");
    setDuplicateId("");
    setPhotos([]);
    setErrors({});
    onOpenChange(false);
  };

  const handlePhotoAdd = () => {
    // Simulate adding a photo
    if (photos.length < 5) {
      setPhotos([...photos, `photo-${Date.now()}.jpg`]);
    }
  };

  const handlePhotoRemove = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Resolve Report (Step {step}/2)
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? "Select how this report should be resolved"
              : "Provide details about the resolution"
            }
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className={cn(
            "flex-1 h-1 rounded-full transition-colors",
            step >= 1 ? "bg-primary" : "bg-muted"
          )} />
          <div className={cn(
            "flex-1 h-1 rounded-full transition-colors",
            step >= 2 ? "bg-primary" : "bg-muted"
          )} />
        </div>

        {/* Report Title */}
        <div className="bg-muted/50 rounded-lg px-4 py-2 mb-4">
          <p className="text-sm text-muted-foreground">Report:</p>
          <p className="font-medium truncate">{report.title}</p>
        </div>

        {/* Step 1: Select Status */}
        {step === 1 && (
          <div className="space-y-4">
            <Label>Resolution Status</Label>
            <RadioGroup
              value={resolutionStatus}
              onValueChange={(value) => setResolutionStatus(value as ResolutionStatus)}
              className="space-y-3"
            >
              {resolutionOptions.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={option.value}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                    resolutionStatus === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status}</p>
            )}
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Selected Status */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-medium capitalize">
                {resolutionOptions.find(o => o.value === resolutionStatus)?.label}
              </span>
            </div>

            {/* Resolution Details */}
            <div className="space-y-2">
              <Label htmlFor="details">
                Resolution Details <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="details"
                placeholder="Describe what was done, action taken, or reason for status..."
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, maxDetails))}
                rows={4}
                className={errors.details ? "border-destructive" : ""}
              />
              <div className="flex items-center justify-between">
                {errors.details && (
                  <p className="text-sm text-destructive">{errors.details}</p>
                )}
                <p className="text-xs text-muted-foreground ml-auto">
                  {details.length}/{maxDetails}
                </p>
              </div>
            </div>

            {/* Duplicate ID (conditional) */}
            {resolutionStatus === "duplicate" && (
              <div className="space-y-2">
                <Label htmlFor="duplicateId">
                  Duplicate of Report <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="duplicateId"
                  placeholder="Enter report ID (e.g., RPT-001a...)"
                  value={duplicateId}
                  onChange={(e) => setDuplicateId(e.target.value)}
                  className={errors.duplicate ? "border-destructive" : ""}
                />
                {errors.duplicate && (
                  <p className="text-sm text-destructive">{errors.duplicate}</p>
                )}
              </div>
            )}

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label>Before/After Photos (Optional)</Label>
              <div className="flex flex-wrap gap-2">
                {photos.map((photo, index) => (
                  <div
                    key={photo}
                    className="relative w-20 h-20 bg-muted rounded-lg flex items-center justify-center group"
                  >
                    <span className="text-xs text-muted-foreground">
                      Photo {index + 1}
                    </span>
                    <button
                      onClick={() => handlePhotoRemove(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <button
                    onClick={handlePhotoAdd}
                    className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span className="text-xs mt-1">Add</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          {step === 1 ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resolving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolve
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

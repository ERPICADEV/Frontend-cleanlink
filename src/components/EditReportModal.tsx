import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type ReportDetail, type ReportUpdateData } from "@/services/reportService";

interface EditReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: ReportDetail;
  onSave: (updates: ReportUpdateData) => Promise<void>;
  isSaving?: boolean;
}

const CATEGORIES = [
  { value: "pothole", label: "Pothole" },
  { value: "garbage", label: "Garbage" },
  { value: "streetlight", label: "Streetlight" },
  { value: "traffic", label: "Traffic" },
  { value: "water", label: "Water" },
  { value: "sewage", label: "Sewage" },
  { value: "other", label: "Other" },
];

export const EditReportModal = ({
  open,
  onOpenChange,
  report,
  onSave,
  isSaving = false,
}: EditReportModalProps) => {
  const [title, setTitle] = useState(report.title);
  const [description, setDescription] = useState(report.description);
  const [category, setCategory] = useState(report.category);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setTitle(report.title);
      setDescription(report.description);
      setCategory(report.category);
      setErrors({});
    }
  }, [open, report]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length < 10) {
      newErrors.title = "Title must be at least 10 characters";
    } else if (title.length > 200) {
      newErrors.title = "Title must be at most 200 characters";
    }

    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    } else if (description.length > 2000) {
      newErrors.description = "Description must be at most 2000 characters";
    }

    if (!category) {
      newErrors.category = "Category is required";
    }

    // Check if report can be edited
    if (report.status !== "pending") {
      newErrors.status = "Only pending reports can be edited";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    const updates: ReportUpdateData = {
      title: title.trim(),
      description: description.trim(),
      category,
    };

    try {
      await onSave(updates);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const canEdit = report.status === "pending";
  const titleCharCount = title.length;
  const descriptionCharCount = description.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>Edit Report</DialogTitle>
        <DialogDescription>
          Update your report details. Only pending reports can be edited.
        </DialogDescription>

        {!canEdit && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">
              This report cannot be edited because it has already been verified or resolved.
            </p>
          </div>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter report title"
              maxLength={200}
              disabled={!canEdit || isSaving}
              className={errors.title ? "border-destructive" : ""}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {titleCharCount}/200 characters
              </span>
              {errors.title && (
                <span className="text-xs text-destructive">{errors.title}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail"
              rows={6}
              maxLength={2000}
              disabled={!canEdit || isSaving}
              className={errors.description ? "border-destructive" : ""}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {descriptionCharCount}/2000 characters
              </span>
              {errors.description && (
                <span className="text-xs text-destructive">{errors.description}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={!canEdit || isSaving}
            >
              <SelectTrigger
                id="category"
                className={errors.category ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <span className="text-xs text-destructive">{errors.category}</span>
            )}
          </div>

          {report.images && Array.isArray(report.images) && report.images.length > 0 && (
            <div className="space-y-2">
              <Label>Images</Label>
              <div className="grid grid-cols-3 gap-2">
                {report.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={typeof img === "string" ? img : ""}
                    alt={`Report image ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-md border border-border"
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Images cannot be edited after report creation
              </p>
            </div>
          )}

          {errors.status && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{errors.status}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canEdit || isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


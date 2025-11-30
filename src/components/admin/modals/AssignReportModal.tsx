import { useState } from "react";
import { UserPlus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "../shared/StatusBadge";
import { CategoryBadge } from "../shared/CategoryBadge";
import type { Report, AdminUser } from "@/types/admin";
import { useAdminUsers } from "@/hooks/useAdminUsers";

interface AssignReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report | null;
  onAssign: (reportId: string, adminId: string, notes: string) => void;
  isLoading?: boolean;
}

// Mock admin users
const mockAdmins: AdminUser[] = [
  { id: "admin-1", name: "Sarah Khan", email: "sarah@gov.in", region: "Delhi", role: "admin" },
  { id: "admin-2", name: "Rajesh Sharma", email: "rajesh@gov.in", region: "Delhi", role: "editor" },
  { id: "admin-3", name: "Priya Singh", email: "priya@gov.in", region: "Mumbai", role: "admin" },
  { id: "admin-4", name: "Amit Patel", email: "amit@gov.in", region: "Bangalore", role: "editor" },
];

export function AssignReportModal({
  open,
  onOpenChange,
  report,
  onAssign,
  isLoading: externalLoading = false,
}: AssignReportModalProps) {
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const isLoading = externalLoading;

  const maxNotes = 200;

  const { admins, loading: adminsLoading } = useAdminUsers();

  const handleSubmit = async () => {
    if (!selectedAdmin) {
      setError("Please select an admin to assign");
      return;
    }
    if (!report) return;

    setError("");
    try {
      await onAssign(report.id, selectedAdmin, notes);
      setSelectedAdmin("");
      setNotes("");
      onOpenChange(false);
    } catch (err) {
      setError("Failed to assign report. Please try again.");
    }
  };

  const handleClose = () => {
    setSelectedAdmin("");
    setNotes("");
    setError("");
    onOpenChange(false);
  };

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Assign Report
        </DialogTitle>
        <DialogDescription>
          Assign this report to an admin for action.
        </DialogDescription>

        {/* Report Summary */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Report ID:</span>
            <code className="bg-card px-2 py-0.5 rounded text-xs font-mono">
              {report.id.slice(0, 12)}...
            </code>
          </div>
          <p className="font-medium">{report.title}</p>
          <div className="flex items-center gap-2">
            <CategoryBadge category={report.category} />
            <StatusBadge status={report.status} />
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin">
              Assign to Admin <span className="text-destructive">*</span>
            </Label>
            <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
              <SelectTrigger className={error ? "border-destructive" : ""}>
                <SelectValue placeholder="Select an admin..." />
              </SelectTrigger>
              <SelectContent>
                {(admins && admins.length > 0 ? admins : mockAdmins).map((admin) => (
                  <SelectItem
                    key={admin.id || admin.userId}
                    value={admin.id || admin.userId}
                    disabled={(admin.id || admin.userId) === report.assignedTo || adminsLoading}
                  >
                    <span className="flex items-center gap-2">
                      <span>{admin.name}</span>
                      {admin.region && (
                        <span className="text-xs text-muted-foreground">
                          ({admin.region})
                        </span>
                      )}
                      {(admin.id || admin.userId) === report.assignedTo && (
                        <span className="text-xs text-muted-foreground">
                          (Current)
                        </span>
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Why assigning? Priority level? Notes for admin?"
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, maxNotes))}
              rows={3}
            />
            <p className="text-xs text-muted-foreground text-right">
              {notes.length}/{maxNotes}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Assign
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

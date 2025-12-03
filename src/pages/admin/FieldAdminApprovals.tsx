import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { usePendingApprovals } from "@/hooks/usePendingApprovals";
import { AdminLayout } from "@/components/admin/AdminLayout";

export default function FieldAdminApprovals() {
  const {
    approvals,
    isLoading,
    approve,
    reject,
    isApproving,
    isRejecting,
  } = usePendingApprovals();
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>(
    {}
  );

  const handleReject = (id: string) => {
    const reason = rejectionReasons[id]?.trim() || "";
    if (!reason || reason.length < 10) return;
    reject(id, reason);
  };

  const pendingApprovals = approvals;

  return (
    <AdminLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Pending Approvals" },
      ]}
    >
      <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pending Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve work submitted by field admins
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-8 w-8 text-muted-foreground mb-2 animate-spin" />
            <p className="text-muted-foreground">Loading approvals…</p>
          </CardContent>
        </Card>
      ) : pendingApprovals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold">No pending approvals</h3>
            <p className="text-muted-foreground text-center mt-2">
              All pending work has been reviewed. Check back later for new
              submissions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingApprovals.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {item.title}
                      <Badge variant="outline" className="capitalize">
                        {item.category.replace(/_/g, " ")}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Submitted by {item.progress.admin.name} •{" "}
                      {formatDistanceToNow(new Date(item.progress.submitted_at), {
                        addSuffix: true,
                      })}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Original Report</h4>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Completion Details</h4>
                  <p className="text-sm">
                    {item.progress.completion_details || "No details provided"}
                  </p>
                </div>

                {item.progress.photos && item.progress.photos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Photos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {item.progress.photos.map((photo, index) => (
                        <button
                          key={index}
                          type="button"
                          className="relative aspect-video overflow-hidden rounded-md border bg-muted"
                          onClick={() => window.open(photo, "_blank")}
                        >
                          <img
                            src={photo}
                            alt={`Resolution photo ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">
                    Rejection Reason (if rejecting)
                  </h4>
                  <Textarea
                    placeholder="Enter reason for rejection (min 10 characters)…"
                    value={rejectionReasons[item.id] || ""}
                    onChange={(e) =>
                      setRejectionReasons((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    className="mb-3"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      className="flex-1"
                      onClick={() => approve(item.id)}
                      disabled={isApproving}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleReject(item.id)}
                      disabled={
                        isRejecting ||
                        !rejectionReasons[item.id] ||
                        rejectionReasons[item.id].trim().length < 10
                      }
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ApprovalItem {
  id: string;
  title: string;
  description: string;
  category: string;
  submittedBy: string;
  submittedAt: string;
  completionDetails: string;
  photos: string[];
  status: 'pending' | 'approved' | 'rejected';
}

const mockApprovals: ApprovalItem[] = [
  {
    id: '1',
    title: 'Pothole repaired on Main St',
    description: 'Large pothole near the intersection filled and sealed',
    category: 'pothole',
    submittedBy: 'John Doe',
    submittedAt: '2024-01-15T10:30:00Z',
    completionDetails: 'Used asphalt patch and compacted properly. Area marked with cones for 24 hours.',
    photos: [],
    status: 'pending'
  },
  {
    id: '2',
    title: 'Garbage collection completed',
    description: 'Illegal dumping site cleaned',
    category: 'garbage',
    submittedBy: 'Jane Smith',
    submittedAt: '2024-01-14T15:45:00Z',
    completionDetails: 'Collected 5 bags of garbage. Area sanitized.',
    photos: [],
    status: 'pending'
  }
];

export default function FieldAdminApprovals() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(mockApprovals);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const handleApprove = (id: string) => {
    setApprovals(approvals.map(item => 
      item.id === id ? { ...item, status: 'approved' } : item
    ));
  };

  const handleReject = (id: string) => {
    if (!rejectionReason.trim()) return;
    setApprovals(approvals.map(item => 
      item.id === id ? { ...item, status: 'rejected' } : item
    ));
    setRejectionReason('');
  };

  const pendingApprovals = approvals.filter(item => item.status === 'pending');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pending Approvals</h1>
        <p className="text-muted-foreground">
          Review and approve completed reports
        </p>
      </div>

      {pendingApprovals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold">No pending approvals</h3>
            <p className="text-muted-foreground text-center mt-2">
              All pending approvals have been reviewed. Check back later for new submissions.
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
                      <Badge variant="outline">{item.category}</Badge>
                    </CardTitle>
                    <CardDescription>
                      Submitted by {item.submittedBy} • {formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })}
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
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Completion Details</h4>
                  <p className="text-sm">{item.completionDetails}</p>
                </div>

                {item.photos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Photos</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {item.photos.map((photo, index) => (
                        <div key={index} className="aspect-video bg-muted rounded-md flex items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Rejection Reason (if rejecting)</h4>
                  <Textarea
                    placeholder="Enter reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mb-3"
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="default" 
                      className="flex-1"
                      onClick={() => handleApprove(item.id)}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleReject(item.id)}
                      disabled={!rejectionReason.trim()}
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
    </div>
  );
}
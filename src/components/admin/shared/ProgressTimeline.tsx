import { format } from 'date-fns';
import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type ProgressStatus = 'pending' | 'assigned' | 'in_progress' | 'pending_approval' | 'resolved' | 'rejected';

interface ProgressStep {
  id: string;
  status: ProgressStatus;
  title: string;
  description?: string;
  timestamp: string;
  user?: {
    name: string;
    role: string;
  };
  notes?: string;
  photos?: string[];
}

interface ProgressTimelineProps {
  steps: ProgressStep[];
  className?: string;
}
const statusIcons = {
  pending: <Clock className="h-4 w-4 text-amber-500" />,
  assigned: <CheckCircle className="h-4 w-4 text-blue-500" />,
  in_progress: <CheckCircle className="h-4 w-4 text-blue-500" />,
  pending_approval: <Clock className="h-4 w-4 text-amber-500" />,
  resolved: <CheckCircle className="h-4 w-4 text-green-500" />,
  rejected: <XCircle className="h-4 w-4 text-red-500" />,
};

const statusColors = {
  pending: 'bg-amber-100 text-amber-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-blue-100 text-blue-800',
  pending_approval: 'bg-amber-100 text-amber-800',
  resolved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export function ProgressTimeline({ steps, className }: ProgressTimelineProps) {
  if (!steps?.length) {
    return (
      <div className="flex items-center justify-center p-4 text-muted-foreground">
        <AlertCircle className="mr-2 h-4 w-4" />
        No progress history available
      </div>
    );
  }

  // Sort steps by timestamp in ascending order
  const sortedSteps = [...steps].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className={cn("flow-root", className)}>
      <ul role="list" className="-mb-8">
        {sortedSteps.map((step, stepIdx) => (
          <li key={step.id}>
            <div className="relative pb-8">
              {stepIdx !== steps.length - 1 ? (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white',
                      statusColors[step.status] || 'bg-gray-100 text-gray-600'
                    )}
                  >
                    {statusIcons[step.status] || <CheckCircle className="h-4 w-4" />}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-800 font-medium">
                      {step.title}
                      {step.user && (
                        <span className="text-muted-foreground"> by {step.user.name}</span>
                      )}
                    </p>
                    {step.description && (
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    )}
                    {step.notes && (
                      <div className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                        {step.notes}
                      </div>
                    )}
                    {step.photos?.length ? (
                      <div className="mt-2 flex space-x-2">
                        {step.photos.map((photo, i) => (
                          <img
                            key={i}
                            src={photo}
                            alt={`Progress photo ${i + 1}`}
                            className="h-16 w-16 rounded-md object-cover"
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-muted-foreground">
                    <time dateTime={step.timestamp}>
                      {format(new Date(step.timestamp), 'MMM d, yyyy h:mm a')}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

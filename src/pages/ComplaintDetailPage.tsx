import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  MapPin,
  Calendar,
  Building2,
  User,
  Mail,
  Phone,
  ArrowLeft,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon
} from 'lucide-react';
import { complaintsApi, feedbackApi } from '@/db/api';
import type { Complaint, Feedback } from '@/types/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import FeedbackForm from '@/components/complaint/FeedbackForm';

const priorityConfig = {
  critical: {
    label: 'Critical',
    className: 'bg-alert text-alert-foreground',
    icon: AlertCircle
  },
  high: {
    label: 'High',
    className: 'bg-warning text-warning-foreground',
    icon: AlertTriangle
  },
  medium: {
    label: 'Medium',
    className: 'bg-primary/80 text-primary-foreground',
    icon: AlertCircle
  },
  low: {
    label: 'Low',
    className: 'bg-muted text-muted-foreground',
    icon: AlertCircle
  }
};

const statusConfig = {
  submitted: { label: 'Submitted', className: 'bg-muted text-muted-foreground' },
  assigned: { label: 'Assigned', className: 'bg-primary/70 text-primary-foreground' },
  in_progress: { label: 'In Progress', className: 'bg-warning/80 text-warning-foreground' },
  resolved: { label: 'Resolved', className: 'bg-success text-success-foreground' },
  closed: { label: 'Closed', className: 'bg-muted text-muted-foreground' }
};

const categoryLabels = {
  infrastructure: 'Infrastructure',
  utilities: 'Utilities',
  sanitation: 'Sanitation',
  traffic: 'Traffic',
  public_safety: 'Public Safety',
  environment: 'Environment',
  health: 'Health',
  other: 'Other'
};

export default function ComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  async function loadData() {
    if (!id) return;
    
    try {
      setLoading(true);
      const [complaintData, feedbackData] = await Promise.all([
        complaintsApi.getById(id),
        feedbackApi.getByComplaintId(id)
      ]);
      setComplaint(complaintData);
      setFeedbacks(feedbackData);
    } catch (error) {
      console.error('Error loading complaint:', error);
      toast({
        title: 'Error',
        description: 'Failed to load complaint details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus: Complaint['status']) {
    if (!id) return;
    
    try {
      setUpdating(true);
      const updated = await complaintsApi.updateStatus(id, newStatus);
      setComplaint(updated);
      toast({
        title: 'Success',
        description: 'Complaint status updated successfully'
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update complaint status',
        variant: 'destructive'
      });
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 xl:p-8 space-y-6">
          <Skeleton className="h-10 w-64 bg-muted" />
          <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
            <div className="xl:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-3/4 bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full bg-muted" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32 bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-48 w-full bg-muted" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout>
        <div className="p-4 xl:p-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-semibold mb-2">Complaint not found</p>
              <Link to="/complaints">
                <Button>Back to Complaints</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const priorityInfo = priorityConfig[complaint.priority];
  const statusInfo = statusConfig[complaint.status];
  const PriorityIcon = priorityInfo.icon;

  const resolutionTime = complaint.resolved_at 
    ? Math.round((new Date(complaint.resolved_at).getTime() - new Date(complaint.created_at).getTime()) / (1000 * 60 * 60))
    : null;

  return (
    <DashboardLayout>
      <div className="p-4 xl:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/complaints">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Complaint Details</h1>
            <p className="text-sm text-muted-foreground">ID: {complaint.id.substring(0, 8)}</p>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-6">
            {/* Complaint Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <PriorityIcon className="h-6 w-6 shrink-0 mt-1" />
                  <div className="flex-1">
                    <CardTitle className="text-xl">{complaint.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge className={cn('', priorityInfo.className)}>
                        {priorityInfo.label}
                      </Badge>
                      <Badge className={cn('', statusInfo.className)}>
                        {statusInfo.label}
                      </Badge>
                      <Badge variant="outline">
                        {categoryLabels[complaint.category]}
                      </Badge>
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        Score: {complaint.priority_score}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{complaint.description}</p>
                </div>

                {complaint.image_urls && complaint.image_urls.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <ImageIcon className="h-4 w-4" />
                      Attachments
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {complaint.image_urls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt={`Attachment ${index + 1}`}
                          className="rounded-lg border border-border object-cover aspect-video"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Location</p>
                        <p className="text-sm">{complaint.location_address}</p>
                      </div>
                    </div>
                    {complaint.department && (
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Department</p>
                          <p className="text-sm">{complaint.department.name}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Submitted</p>
                        <p className="text-sm">{new Date(complaint.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    {complaint.resolved_at && (
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Resolved</p>
                          <p className="text-sm">{new Date(complaint.resolved_at).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Citizen Information */}
            {(complaint.citizen_name || complaint.citizen_email || complaint.citizen_phone) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Citizen Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {complaint.citizen_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{complaint.citizen_name}</span>
                    </div>
                  )}
                  {complaint.citizen_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{complaint.citizen_email}</span>
                    </div>
                  )}
                  {complaint.citizen_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{complaint.citizen_phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Feedback Section */}
            {(complaint.status === 'resolved' || complaint.status === 'closed') && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Feedback</CardTitle>
                  <CardDescription>Citizen feedback and ratings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {feedbacks.length > 0 ? (
                    feedbacks.map(feedback => (
                      <div key={feedback.id} className="border border-border rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Overall Rating</p>
                            <p className="text-lg font-bold">{'⭐'.repeat(feedback.rating)}</p>
                          </div>
                          {feedback.response_time_rating && (
                            <div>
                              <p className="text-xs text-muted-foreground">Response Time</p>
                              <p className="text-sm">{'⭐'.repeat(feedback.response_time_rating)}</p>
                            </div>
                          )}
                          {feedback.resolution_quality_rating && (
                            <div>
                              <p className="text-xs text-muted-foreground">Quality</p>
                              <p className="text-sm">{'⭐'.repeat(feedback.resolution_quality_rating)}</p>
                            </div>
                          )}
                        </div>
                        {feedback.comment && (
                          <p className="text-sm text-muted-foreground">{feedback.comment}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(feedback.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <FeedbackForm complaintId={complaint.id} onSuccess={loadData} />
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Update Status</label>
                  <Select
                    value={complaint.status}
                    onValueChange={handleStatusChange}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Priority Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Priority Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Priority Score</span>
                  <span className="text-lg font-bold text-primary">{complaint.priority_score}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Urgency</span>
                    <span className="font-medium">{complaint.urgency_factor.toFixed(1)}x</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Severity</span>
                    <span className="font-medium">{complaint.severity_factor.toFixed(1)}x</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Impact</span>
                    <span className="font-medium">{complaint.impact_factor.toFixed(1)}x</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm">{new Date(complaint.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {complaint.assigned_at && (
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Assigned</p>
                      <p className="text-sm">{new Date(complaint.assigned_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {complaint.resolved_at && (
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Resolved</p>
                      <p className="text-sm">{new Date(complaint.resolved_at).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {resolutionTime && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">Resolution Time</p>
                    <p className="text-lg font-bold text-success">{resolutionTime}h</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  MapPin,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { complaintsApi, statsApi } from '@/db/api';
import type { Complaint, DashboardStats, ComplaintMarker } from '@/types/types';
import { cn } from '@/lib/utils';

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

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  trend,
  className 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  description?: string;
  trend?: string;
  className?: string;
}) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs text-success">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ComplaintListItem({ complaint }: { complaint: Complaint }) {
  const priorityInfo = priorityConfig[complaint.priority];
  const statusInfo = statusConfig[complaint.status];
  const PriorityIcon = priorityInfo.icon;

  return (
    <Link 
      to={`/complaints/${complaint.id}`}
      className="block p-4 border-b border-border hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <PriorityIcon className="h-4 w-4 shrink-0" />
            <h3 className="font-semibold text-sm truncate">{complaint.title}</h3>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {complaint.description}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn('text-xs', priorityInfo.className)}>
              {priorityInfo.label}
            </Badge>
            <Badge variant="outline" className={cn('text-xs', statusInfo.className)}>
              {statusInfo.label}
            </Badge>
            {complaint.location_address && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {complaint.location_address.substring(0, 30)}...
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-semibold text-primary">
            Score: {complaint.priority_score}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {new Date(complaint.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Link>
  );
}

function MapView({ markers }: { markers: ComplaintMarker[] }) {
  return (
    <div className="relative w-full h-full min-h-[400px] bg-muted rounded-lg overflow-hidden">
      <img 
        src="https://miaoda-site-img.s3cdn.medo.dev/images/4dc8ed25-7315-4f57-b81f-1642cd9e97f0.jpg"
        alt="City map with complaint locations"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Active Complaints</p>
                <p className="text-2xl font-bold text-primary">{markers.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-primary" />
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-xs">
              <div className="text-center">
                <div className="font-semibold text-alert">
                  {markers.filter(m => m.priority === 'critical').length}
                </div>
                <div className="text-muted-foreground">Critical</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-warning">
                  {markers.filter(m => m.priority === 'high').length}
                </div>
                <div className="text-muted-foreground">High</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-primary">
                  {markers.filter(m => m.priority === 'medium').length}
                </div>
                <div className="text-muted-foreground">Medium</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-muted-foreground">
                  {markers.filter(m => m.priority === 'low').length}
                </div>
                <div className="text-muted-foreground">Low</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [markers, setMarkers] = useState<ComplaintMarker[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [statsData, complaintsData, markersData] = await Promise.all([
        statsApi.getDashboardStats(),
        complaintsApi.getAll({ status: ['submitted', 'assigned', 'in_progress'] }, 10),
        complaintsApi.getMarkers()
      ]);
      setStats(statsData);
      setComplaints(complaintsData);
      setMarkers(markersData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 xl:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered complaint prioritization and management system
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-24 bg-muted" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Complaints"
              value={stats.total_complaints}
              icon={AlertCircle}
              description="All time"
            />
            <StatCard
              title="Critical Issues"
              value={stats.critical_complaints}
              icon={AlertCircle}
              description="Requires immediate attention"
              className="border-alert/50"
            />
            <StatCard
              title="Resolved Today"
              value={stats.resolved_today}
              icon={CheckCircle2}
              description="Completed resolutions"
            />
            <StatCard
              title="Avg Resolution Time"
              value={`${stats.avg_resolution_time}h`}
              icon={Clock}
              description="Average response time"
            />
          </div>
        ) : null}

        {/* Main Content Grid */}
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">
          {/* Recent Complaints */}
          <Card className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Complaints</CardTitle>
                  <CardDescription>Latest high-priority issues</CardDescription>
                </div>
                <Link to="/complaints">
                  <Button variant="ghost" size="sm">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              {loading ? (
                <div className="space-y-4 p-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full bg-muted" />
                  ))}
                </div>
              ) : complaints.length > 0 ? (
                <div className="divide-y divide-border">
                  {complaints.map(complaint => (
                    <ComplaintListItem key={complaint.id} complaint={complaint} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No active complaints
                </div>
              )}
            </CardContent>
          </Card>

          {/* Map View */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Complaint Locations</CardTitle>
              <CardDescription>Geographic distribution of active issues</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {loading ? (
                <Skeleton className="h-[400px] w-full bg-muted" />
              ) : (
                <MapView markers={markers} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
              <Link to="/complaints/new">
                <Button className="w-full" variant="default">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Submit New Complaint
                </Button>
              </Link>
              <Link to="/complaints?priority=critical">
                <Button className="w-full" variant="outline">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  View Critical Issues
                </Button>
              </Link>
              <Link to="/performance">
                <Button className="w-full" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Performance Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

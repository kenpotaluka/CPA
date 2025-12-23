import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Star,
  Building2,
  AlertCircle
} from 'lucide-react';
import { statsApi } from '@/db/api';
import type { DepartmentPerformance } from '@/types/types';
import { cn } from '@/lib/utils';

function PerformanceCard({ 
  department 
}: { 
  department: DepartmentPerformance;
}) {
  const resolutionRate = department.total_complaints > 0
    ? Math.round((department.resolved_complaints / department.total_complaints) * 100)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{department.department_name}</CardTitle>
          </div>
          {resolutionRate >= 80 && (
            <Badge className="bg-success text-success-foreground">
              Excellent
            </Badge>
          )}
          {resolutionRate >= 60 && resolutionRate < 80 && (
            <Badge className="bg-warning text-warning-foreground">
              Good
            </Badge>
          )}
          {resolutionRate < 60 && (
            <Badge className="bg-alert text-alert-foreground">
              Needs Improvement
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Total Complaints</p>
            <p className="text-2xl font-bold">{department.total_complaints}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Resolved</p>
            <p className="text-2xl font-bold text-success">{department.resolved_complaints}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-warning">{department.pending_complaints}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Resolution Rate</p>
            <p className="text-2xl font-bold text-primary">{resolutionRate}%</p>
          </div>
        </div>

        {/* Metrics */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Avg Resolution Time</span>
            </div>
            <span className="font-semibold">
              {department.avg_resolution_time_hours > 0 
                ? `${department.avg_resolution_time_hours}h`
                : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>Avg Rating</span>
            </div>
            <span className="font-semibold">
              {department.avg_rating > 0 
                ? `${department.avg_rating}/5`
                : 'No ratings'}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{resolutionRate}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full transition-all',
                resolutionRate >= 80 ? 'bg-success' : 
                resolutionRate >= 60 ? 'bg-warning' : 
                'bg-alert'
              )}
              style={{ width: `${resolutionRate}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryCard({ 
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

export default function PerformancePage() {
  const [performance, setPerformance] = useState<DepartmentPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await statsApi.getDepartmentPerformance();
      setPerformance(data);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate overall metrics
  const totalComplaints = performance.reduce((sum, d) => sum + d.total_complaints, 0);
  const totalResolved = performance.reduce((sum, d) => sum + d.resolved_complaints, 0);
  const totalPending = performance.reduce((sum, d) => sum + d.pending_complaints, 0);
  const overallResolutionRate = totalComplaints > 0 
    ? Math.round((totalResolved / totalComplaints) * 100)
    : 0;

  const departmentsWithRatings = performance.filter(d => d.avg_rating > 0);
  const avgRating = departmentsWithRatings.length > 0
    ? departmentsWithRatings.reduce((sum, d) => sum + d.avg_rating, 0) / departmentsWithRatings.length
    : 0;

  const departmentsWithTime = performance.filter(d => d.avg_resolution_time_hours > 0);
  const avgResolutionTime = departmentsWithTime.length > 0
    ? departmentsWithTime.reduce((sum, d) => sum + d.avg_resolution_time_hours, 0) / departmentsWithTime.length
    : 0;

  return (
    <DashboardLayout>
      <div className="p-4 xl:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Performance Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Department-wise performance metrics and analytics
          </p>
        </div>

        {/* Overall Summary */}
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
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Complaints"
              value={totalComplaints}
              icon={AlertCircle}
              description="Across all departments"
            />
            <SummaryCard
              title="Resolution Rate"
              value={`${overallResolutionRate}%`}
              icon={CheckCircle2}
              description="Overall completion rate"
              className="border-success/50"
            />
            <SummaryCard
              title="Avg Rating"
              value={avgRating > 0 ? `${avgRating.toFixed(1)}/5` : 'N/A'}
              icon={Star}
              description="Citizen satisfaction"
            />
            <SummaryCard
              title="Avg Resolution Time"
              value={avgResolutionTime > 0 ? `${Math.round(avgResolutionTime)}h` : 'N/A'}
              icon={Clock}
              description="Average response time"
            />
          </div>
        )}

        {/* Department Performance Cards */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Department Performance</h2>
          {loading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 bg-muted" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : performance.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {performance.map(dept => (
                <PerformanceCard key={dept.department_id} department={dept} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No performance data available</p>
                <p className="text-sm text-muted-foreground">
                  Performance metrics will appear once complaints are processed
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
            <CardDescription>AI-powered analysis and recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {performance.length > 0 ? (
              <>
                {/* Best Performing Department */}
                {(() => {
                  const best = performance.reduce((prev, current) => {
                    const prevRate = prev.total_complaints > 0 
                      ? prev.resolved_complaints / prev.total_complaints 
                      : 0;
                    const currentRate = current.total_complaints > 0 
                      ? current.resolved_complaints / current.total_complaints 
                      : 0;
                    return currentRate > prevRate ? current : prev;
                  });
                  const rate = best.total_complaints > 0 
                    ? Math.round((best.resolved_complaints / best.total_complaints) * 100)
                    : 0;
                  
                  return (
                    <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">Best Performing Department</p>
                        <p className="text-sm text-muted-foreground">
                          {best.department_name} has a {rate}% resolution rate with {best.resolved_complaints} resolved complaints
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Needs Attention */}
                {(() => {
                  const needsAttention = performance.filter(d => {
                    const rate = d.total_complaints > 0 
                      ? (d.resolved_complaints / d.total_complaints) * 100
                      : 0;
                    return rate < 60 && d.pending_complaints > 0;
                  });
                  
                  if (needsAttention.length > 0) {
                    return (
                      <div className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Needs Attention</p>
                          <p className="text-sm text-muted-foreground">
                            {needsAttention.map(d => d.department_name).join(', ')} {needsAttention.length === 1 ? 'has' : 'have'} pending complaints requiring attention
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* High Volume Alert */}
                {(() => {
                  const highVolume = performance.filter(d => d.pending_complaints > 5);
                  
                  if (highVolume.length > 0) {
                    return (
                      <div className="flex items-start gap-3 p-3 bg-primary/10 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">High Volume Departments</p>
                          <p className="text-sm text-muted-foreground">
                            {highVolume.map(d => `${d.department_name} (${d.pending_complaints})`).join(', ')} - Consider resource allocation
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Insights will be generated once performance data is available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

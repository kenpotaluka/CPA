import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertCircle, 
  Search,
  Filter,
  MapPin,
  Calendar,
  Building2,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { complaintsApi, departmentsApi } from '@/db/api';
import type { Complaint, Department, ComplaintFilters } from '@/types/types';
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

function ComplaintCard({ complaint }: { complaint: Complaint }) {
  const priorityInfo = priorityConfig[complaint.priority];
  const statusInfo = statusConfig[complaint.status];
  const PriorityIcon = priorityInfo.icon;

  return (
    <Link to={`/complaints/${complaint.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <PriorityIcon className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base line-clamp-1">{complaint.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {complaint.description}
                </CardDescription>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-bold text-primary">
                {complaint.priority_score}
              </div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge className={cn('text-xs', priorityInfo.className)}>
              {priorityInfo.label}
            </Badge>
            <Badge className={cn('text-xs', statusInfo.className)}>
              {statusInfo.label}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {categoryLabels[complaint.category]}
            </Badge>
          </div>
          
          <div className="space-y-1.5 text-xs text-muted-foreground">
            {complaint.location_address && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{complaint.location_address}</span>
              </div>
            )}
            {complaint.department && (
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{complaint.department.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span>{new Date(complaint.created_at).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function ComplaintsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');

  const filters: ComplaintFilters = {
    status: searchParams.get('status')?.split(',') as any,
    priority: searchParams.get('priority')?.split(',') as any,
    category: searchParams.get('category')?.split(',') as any,
    department_id: searchParams.get('department') || undefined,
    search: searchParams.get('search') || undefined
  };

  useEffect(() => {
    loadData();
  }, [searchParams]);

  async function loadData() {
    try {
      setLoading(true);
      const [complaintsData, departmentsData] = await Promise.all([
        complaintsApi.getAll(filters, 100),
        departmentsApi.getAll()
      ]);
      setComplaints(complaintsData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error('Error loading complaints:', error);
    } finally {
      setLoading(false);
    }
  }

  function updateFilter(key: string, value: string) {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  }

  function handleSearch() {
    updateFilter('search', searchTerm);
  }

  return (
    <DashboardLayout>
      <div className="p-4 xl:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">All Complaints</h1>
            <p className="text-muted-foreground mt-1">
              Browse and manage all submitted complaints
            </p>
          </div>
          <Link to="/complaints/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Submit Complaint
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <CardTitle>Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
              {/* Search */}
              <div className="sm:col-span-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search complaints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Priority Filter */}
              <Select
                value={filters.priority?.[0] || 'all'}
                onValueChange={(value) => updateFilter('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={filters.status?.[0] || 'all'}
                onValueChange={(value) => updateFilter('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="assigned">Assigned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select
                value={filters.category?.[0] || 'all'}
                onValueChange={(value) => updateFilter('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="sanitation">Sanitation</SelectItem>
                  <SelectItem value="traffic">Traffic</SelectItem>
                  <SelectItem value="public_safety">Public Safety</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="health">Health</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : `${complaints.length} complaints found`}
            </p>
          </div>

          {loading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 bg-muted" />
                    <Skeleton className="h-4 w-full bg-muted mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : complaints.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {complaints.map(complaint => (
                <ComplaintCard key={complaint.id} complaint={complaint} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No complaints found</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={() => setSearchParams(new URLSearchParams())}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

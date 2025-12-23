import { supabase } from './supabase';
import type {
  Complaint,
  ComplaintFormData,
  Department,
  Feedback,
  FeedbackFormData,
  DashboardStats,
  DepartmentPerformance,
  ComplaintFilters,
  ComplaintMarker
} from '@/types/types';

// Departments API
export const departmentsApi = {
  async getAll(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<Department | null> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
};

// Complaints API
export const complaintsApi = {
  async getAll(filters?: ComplaintFilters, limit = 50): Promise<Complaint[]> {
    let query = supabase
      .from('complaints')
      .select(`
        *,
        department:departments(*)
      `)
      .order('priority_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }
    if (filters?.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }
    if (filters?.category && filters.category.length > 0) {
      query = query.in('category', filters.category);
    }
    if (filters?.department_id) {
      query = query.eq('department_id', filters.department_id);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters?.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters?.date_to) {
      query = query.lte('created_at', filters.date_to);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<Complaint | null> {
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        department:departments(*)
      `)
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(complaintData: ComplaintFormData): Promise<Complaint> {
    // Auto-assign department based on category
    const { data: departments } = await supabase
      .from('departments')
      .select('id')
      .eq('category', complaintData.category)
      .limit(1)
      .maybeSingle();

    // Calculate initial priority score
    const priorityScore = calculatePriorityScore(complaintData);
    const priority = determinePriority(priorityScore);

    const { data, error } = await supabase
      .from('complaints')
      .insert({
        ...complaintData,
        department_id: departments?.id || null,
        priority,
        priority_score: priorityScore,
        status: 'submitted'
      })
      .select(`
        *,
        department:departments(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Complaint>): Promise<Complaint> {
    const { data, error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        department:departments(*)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateStatus(id: string, status: Complaint['status']): Promise<Complaint> {
    const updates: any = { status };
    
    if (status === 'assigned') {
      updates.assigned_at = new Date().toISOString();
    } else if (status === 'resolved' || status === 'closed') {
      updates.resolved_at = new Date().toISOString();
    }

    return this.update(id, updates);
  },

  async getMarkers(): Promise<ComplaintMarker[]> {
    const { data, error } = await supabase
      .from('complaints')
      .select('id, title, priority, status, location_lat, location_lng, category')
      .not('location_lat', 'is', null)
      .not('location_lng', 'is', null)
      .limit(100);
    
    if (error) throw error;
    
    return Array.isArray(data) 
      ? data.map(c => ({
          id: c.id,
          title: c.title,
          priority: c.priority,
          status: c.status,
          lat: c.location_lat!,
          lng: c.location_lng!,
          category: c.category
        }))
      : [];
  }
};

// Feedback API
export const feedbackApi = {
  async getByComplaintId(complaintId: string): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .eq('complaint_id', complaintId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(feedbackData: FeedbackFormData): Promise<Feedback> {
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedbackData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Dashboard Stats API
export const statsApi = {
  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    // Get total complaints
    const { count: totalCount } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true });

    // Get critical complaints
    const { count: criticalCount } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('priority', 'critical')
      .in('status', ['submitted', 'assigned', 'in_progress']);

    // Get high priority complaints
    const { count: highCount } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('priority', 'high')
      .in('status', ['submitted', 'assigned', 'in_progress']);

    // Get resolved today
    const { count: resolvedToday } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .gte('resolved_at', todayStr)
      .in('status', ['resolved', 'closed']);

    // Get pending complaints
    const { count: pendingCount } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .in('status', ['submitted', 'assigned', 'in_progress']);

    // Calculate average resolution time
    const { data: resolvedComplaints } = await supabase
      .from('complaints')
      .select('created_at, resolved_at')
      .not('resolved_at', 'is', null)
      .limit(100);

    let avgResolutionTime = 0;
    if (resolvedComplaints && resolvedComplaints.length > 0) {
      const totalTime = resolvedComplaints.reduce((sum, c) => {
        const created = new Date(c.created_at).getTime();
        const resolved = new Date(c.resolved_at!).getTime();
        return sum + (resolved - created);
      }, 0);
      avgResolutionTime = totalTime / resolvedComplaints.length / (1000 * 60 * 60); // Convert to hours
    }

    return {
      total_complaints: totalCount || 0,
      critical_complaints: criticalCount || 0,
      high_priority_complaints: highCount || 0,
      resolved_today: resolvedToday || 0,
      avg_resolution_time: Math.round(avgResolutionTime * 10) / 10,
      pending_complaints: pendingCount || 0
    };
  },

  async getDepartmentPerformance(): Promise<DepartmentPerformance[]> {
    const { data: departments } = await supabase
      .from('departments')
      .select('id, name');

    if (!departments) return [];

    const performance: DepartmentPerformance[] = [];

    for (const dept of departments) {
      // Get total complaints
      const { count: totalCount } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('department_id', dept.id);

      // Get resolved complaints
      const { count: resolvedCount } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('department_id', dept.id)
        .in('status', ['resolved', 'closed']);

      // Get pending complaints
      const { count: pendingCount } = await supabase
        .from('complaints')
        .select('*', { count: 'exact', head: true })
        .eq('department_id', dept.id)
        .in('status', ['submitted', 'assigned', 'in_progress']);

      // Calculate average resolution time
      const { data: resolvedComplaints } = await supabase
        .from('complaints')
        .select('created_at, resolved_at')
        .eq('department_id', dept.id)
        .not('resolved_at', 'is', null)
        .limit(50);

      let avgResolutionTime = 0;
      if (resolvedComplaints && resolvedComplaints.length > 0) {
        const totalTime = resolvedComplaints.reduce((sum, c) => {
          const created = new Date(c.created_at).getTime();
          const resolved = new Date(c.resolved_at!).getTime();
          return sum + (resolved - created);
        }, 0);
        avgResolutionTime = totalTime / resolvedComplaints.length / (1000 * 60 * 60);
      }

      // Get average rating
      const { data: deptComplaints } = await supabase
        .from('complaints')
        .select('id')
        .eq('department_id', dept.id);
      
      const complaintIds = deptComplaints?.map(c => c.id) || [];
      
      let avgRating = 0;
      if (complaintIds.length > 0) {
        const { data: feedbacks } = await supabase
          .from('feedback')
          .select('rating')
          .in('complaint_id', complaintIds);
        
        if (feedbacks && feedbacks.length > 0) {
          avgRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;
        }
      }

      performance.push({
        department_id: dept.id,
        department_name: dept.name,
        total_complaints: totalCount || 0,
        resolved_complaints: resolvedCount || 0,
        avg_resolution_time_hours: Math.round(avgResolutionTime * 10) / 10,
        avg_rating: Math.round(avgRating * 10) / 10,
        pending_complaints: pendingCount || 0
      });
    }

    return performance;
  }
};

// Helper functions for priority calculation
function calculatePriorityScore(complaint: ComplaintFormData): number {
  // Base score
  let score = 50;

  // Category-based scoring
  const categoryScores: Record<string, number> = {
    infrastructure: 20,
    utilities: 18,
    public_safety: 22,
    traffic: 15,
    health: 20,
    environment: 10,
    sanitation: 12,
    other: 8
  };

  score += categoryScores[complaint.category] || 10;

  // Keywords that increase urgency
  const urgentKeywords = ['emergency', 'urgent', 'immediate', 'danger', 'accident', 'fallen', 'leak', 'fire', 'flood'];
  const description = (complaint.title + ' ' + complaint.description).toLowerCase();
  
  const urgentMatches = urgentKeywords.filter(keyword => description.includes(keyword)).length;
  score += urgentMatches * 10;

  // Cap the score between 0 and 100
  return Math.min(100, Math.max(0, score));
}

function determinePriority(score: number): Complaint['priority'] {
  if (score >= 85) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

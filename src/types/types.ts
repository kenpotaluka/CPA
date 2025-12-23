// Enum types matching database
export type ComplaintPriority = 'critical' | 'high' | 'medium' | 'low';
export type ComplaintStatus = 'submitted' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
export type ComplaintCategory = 
  | 'infrastructure'
  | 'utilities'
  | 'sanitation'
  | 'traffic'
  | 'public_safety'
  | 'environment'
  | 'health'
  | 'other';

// Profile interface (for auth context compatibility)
export interface Profile {
  id: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

// Department interface
export interface Department {
  id: string;
  name: string;
  category: ComplaintCategory;
  contact_email: string | null;
  contact_phone: string | null;
  description: string | null;
  created_at: string;
}

// Complaint interface
export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  location_address: string;
  location_lat: number | null;
  location_lng: number | null;
  department_id: string | null;
  citizen_name: string | null;
  citizen_email: string | null;
  citizen_phone: string | null;
  image_urls: string[] | null;
  priority_score: number;
  urgency_factor: number;
  severity_factor: number;
  impact_factor: number;
  similar_complaints_count: number;
  created_at: string;
  updated_at: string;
  assigned_at: string | null;
  resolved_at: string | null;
  department?: Department;
}

// Feedback interface
export interface Feedback {
  id: string;
  complaint_id: string;
  rating: number;
  comment: string | null;
  response_time_rating: number | null;
  resolution_quality_rating: number | null;
  created_at: string;
}

// Analytics interface
export interface ComplaintAnalytics {
  id: string;
  date: string;
  category: ComplaintCategory;
  location_area: string | null;
  total_complaints: number;
  avg_resolution_time_hours: number | null;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  created_at: string;
}

// Form data interfaces
export interface ComplaintFormData {
  title: string;
  description: string;
  category: ComplaintCategory;
  location_address: string;
  location_lat?: number;
  location_lng?: number;
  citizen_name?: string;
  citizen_email?: string;
  citizen_phone?: string;
  image_urls?: string[];
}

export interface FeedbackFormData {
  complaint_id: string;
  rating: number;
  comment?: string;
  response_time_rating?: number;
  resolution_quality_rating?: number;
}

// Dashboard statistics
export interface DashboardStats {
  total_complaints: number;
  critical_complaints: number;
  high_priority_complaints: number;
  resolved_today: number;
  avg_resolution_time: number;
  pending_complaints: number;
}

// Performance metrics
export interface DepartmentPerformance {
  department_id: string;
  department_name: string;
  total_complaints: number;
  resolved_complaints: number;
  avg_resolution_time_hours: number;
  avg_rating: number;
  pending_complaints: number;
}

// Map marker data
export interface ComplaintMarker {
  id: string;
  title: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  lat: number;
  lng: number;
  category: ComplaintCategory;
}

// Filter options
export interface ComplaintFilters {
  status?: ComplaintStatus[];
  priority?: ComplaintPriority[];
  category?: ComplaintCategory[];
  department_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

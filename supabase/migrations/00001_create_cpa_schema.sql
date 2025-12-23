-- Create enum types
CREATE TYPE complaint_priority AS ENUM ('critical', 'high', 'medium', 'low');
CREATE TYPE complaint_status AS ENUM ('submitted', 'assigned', 'in_progress', 'resolved', 'closed');
CREATE TYPE complaint_category AS ENUM (
  'infrastructure',
  'utilities',
  'sanitation',
  'traffic',
  'public_safety',
  'environment',
  'health',
  'other'
);

-- Create departments table
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category complaint_category NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create complaints table
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category complaint_category NOT NULL,
  priority complaint_priority NOT NULL DEFAULT 'medium',
  status complaint_status NOT NULL DEFAULT 'submitted',
  location_address TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  department_id UUID REFERENCES departments(id),
  citizen_name TEXT,
  citizen_email TEXT,
  citizen_phone TEXT,
  image_urls TEXT[],
  priority_score INTEGER DEFAULT 50,
  urgency_factor DECIMAL(3, 2) DEFAULT 1.0,
  severity_factor DECIMAL(3, 2) DEFAULT 1.0,
  impact_factor DECIMAL(3, 2) DEFAULT 1.0,
  similar_complaints_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ
);

-- Create feedback table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  response_time_rating INTEGER CHECK (response_time_rating >= 1 AND response_time_rating <= 5),
  resolution_quality_rating INTEGER CHECK (resolution_quality_rating >= 1 AND resolution_quality_rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create analytics table for tracking patterns
CREATE TABLE complaint_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  category complaint_category NOT NULL,
  location_area TEXT,
  total_complaints INTEGER DEFAULT 0,
  avg_resolution_time_hours DECIMAL(10, 2),
  critical_count INTEGER DEFAULT 0,
  high_count INTEGER DEFAULT 0,
  medium_count INTEGER DEFAULT 0,
  low_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, category, location_area)
);

-- Create indexes for performance
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_department ON complaints(department_id);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_complaints_location ON complaints(location_lat, location_lng);
CREATE INDEX idx_feedback_complaint ON feedback(complaint_id);
CREATE INDEX idx_analytics_date ON complaint_analytics(date DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_complaints_updated_at
  BEFORE UPDATE ON complaints
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required)
CREATE POLICY "Allow public read access to departments"
  ON departments FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to complaints"
  ON complaints FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to complaints"
  ON complaints FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to complaints"
  ON complaints FOR UPDATE
  USING (true);

CREATE POLICY "Allow public read access to feedback"
  ON feedback FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public read access to analytics"
  ON complaint_analytics FOR SELECT
  USING (true);

-- Insert sample departments
INSERT INTO departments (name, category, contact_email, contact_phone, description) VALUES
  ('Public Works Department', 'infrastructure'::complaint_category, 'publicworks@city.gov', '555-0101', 'Handles roads, bridges, and public infrastructure'),
  ('Water & Sewage Department', 'utilities'::complaint_category, 'water@city.gov', '555-0102', 'Manages water supply and sewage systems'),
  ('Sanitation Department', 'sanitation'::complaint_category, 'sanitation@city.gov', '555-0103', 'Responsible for waste management and cleanliness'),
  ('Traffic Management', 'traffic'::complaint_category, 'traffic@city.gov', '555-0104', 'Handles traffic signals, signs, and road safety'),
  ('Police Department', 'public_safety'::complaint_category, 'police@city.gov', '555-0105', 'Public safety and law enforcement'),
  ('Environmental Services', 'environment'::complaint_category, 'environment@city.gov', '555-0106', 'Environmental protection and conservation'),
  ('Health Department', 'health'::complaint_category, 'health@city.gov', '555-0107', 'Public health services and inspections'),
  ('General Services', 'other'::complaint_category, 'general@city.gov', '555-0108', 'Handles miscellaneous city services');

-- Insert sample complaints for demonstration
INSERT INTO complaints (
  title, description, category, priority, status, location_address, 
  location_lat, location_lng, department_id, citizen_name, citizen_email, 
  priority_score, urgency_factor, severity_factor, impact_factor
)
SELECT 
  'Fallen Electric Pole on Main Street',
  'An electric pole has fallen and is blocking traffic. This is an emergency situation requiring immediate attention.',
  'infrastructure'::complaint_category,
  'critical'::complaint_priority,
  'assigned'::complaint_status,
  '123 Main Street, Downtown',
  40.7128,
  -74.0060,
  (SELECT id FROM departments WHERE category = 'infrastructure'::complaint_category LIMIT 1),
  'John Doe',
  'john.doe@email.com',
  95,
  1.5,
  1.8,
  1.7
UNION ALL
SELECT 
  'Water Leak on Oak Avenue',
  'Major water leak causing flooding on the street. Water is flowing continuously.',
  'utilities'::complaint_category,
  'high'::complaint_priority,
  'in_progress'::complaint_status,
  '456 Oak Avenue, Westside',
  40.7589,
  -73.9851,
  (SELECT id FROM departments WHERE category = 'utilities'::complaint_category LIMIT 1),
  'Jane Smith',
  'jane.smith@email.com',
  82,
  1.3,
  1.4,
  1.2
UNION ALL
SELECT 
  'Overflowing Garbage Bins',
  'Multiple garbage bins are overflowing in the park area. Attracting pests.',
  'sanitation'::complaint_category,
  'medium'::complaint_priority,
  'submitted'::complaint_status,
  '789 Park Lane, Eastside',
  40.7489,
  -73.9680,
  (SELECT id FROM departments WHERE category = 'sanitation'::complaint_category LIMIT 1),
  'Mike Johnson',
  'mike.j@email.com',
  55,
  0.8,
  0.9,
  1.0
UNION ALL
SELECT 
  'Broken Traffic Light',
  'Traffic light at intersection not working, causing traffic congestion.',
  'traffic'::complaint_category,
  'high'::complaint_priority,
  'assigned'::complaint_status,
  'Intersection of 5th and Broadway',
  40.7614,
  -73.9776,
  (SELECT id FROM departments WHERE category = 'traffic'::complaint_category LIMIT 1),
  'Sarah Williams',
  'sarah.w@email.com',
  78,
  1.2,
  1.3,
  1.5
UNION ALL
SELECT 
  'Pothole on Highway 101',
  'Large pothole causing vehicle damage. Multiple complaints received.',
  'infrastructure'::complaint_category,
  'medium'::complaint_priority,
  'submitted'::complaint_status,
  'Highway 101, Mile Marker 45',
  40.7282,
  -74.0776,
  (SELECT id FROM departments WHERE category = 'infrastructure'::complaint_category LIMIT 1),
  'Robert Brown',
  'robert.b@email.com',
  62,
  0.9,
  1.1,
  1.2
UNION ALL
SELECT 
  'Illegal Dumping Site',
  'Construction waste illegally dumped in residential area.',
  'environment'::complaint_category,
  'medium'::complaint_priority,
  'submitted'::complaint_status,
  '321 Elm Street, Northside',
  40.7789,
  -73.9551,
  (SELECT id FROM departments WHERE category = 'environment'::complaint_category LIMIT 1),
  'Emily Davis',
  'emily.d@email.com',
  58,
  0.7,
  1.0,
  0.9
UNION ALL
SELECT 
  'Street Light Not Working',
  'Multiple street lights out on residential street, safety concern.',
  'public_safety'::complaint_category,
  'low'::complaint_priority,
  'submitted'::complaint_status,
  '654 Maple Drive, Southside',
  40.7089,
  -74.0151,
  (SELECT id FROM departments WHERE category = 'public_safety'::complaint_category LIMIT 1),
  'David Wilson',
  'david.w@email.com',
  35,
  0.6,
  0.7,
  0.8
UNION ALL
SELECT 
  'Stray Dogs in Neighborhood',
  'Pack of stray dogs roaming the neighborhood, potential safety risk.',
  'public_safety'::complaint_category,
  'medium'::complaint_priority,
  'submitted'::complaint_status,
  '987 Cedar Road, Central',
  40.7389,
  -73.9951,
  (SELECT id FROM departments WHERE category = 'public_safety'::complaint_category LIMIT 1),
  'Lisa Anderson',
  'lisa.a@email.com',
  60,
  0.9,
  1.0,
  1.1;

-- Create storage bucket for complaint images
INSERT INTO storage.buckets (id, name, public)
VALUES ('complaint_images', 'complaint_images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for public upload
CREATE POLICY "Allow public upload to complaint_images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'complaint_images');

CREATE POLICY "Allow public read from complaint_images"
ON storage.objects FOR SELECT
USING (bucket_id = 'complaint_images');
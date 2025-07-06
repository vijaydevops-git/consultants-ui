export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'recruiter';
}

export interface Consultant {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  skills: string[];
  experience_years?: number;
  rate_per_hour?: number;
  availability_status: 'available' | 'busy' | 'unavailable';
  location?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: number;
  name: string;
  industry?: string;
  location?: string;
  website?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: number;
  consultant_id: number;
  company_id: number;
  recruiter_id: number;
  position_title: string;
  submission_date: string;
  status: 'submitted' | 'interviewing' | 'rejected' | 'accepted' | 'withdrawn';
  rate_submitted?: number;
  notes?: string;
  interview_date?: string;
  feedback?: string;
  created_at: string;
  updated_at: string;
  consultant_first_name?: string;
  consultant_last_name?: string;
  company_name?: string;
  recruiter_first_name?: string;
  recruiter_last_name?: string;
}

export interface SubmissionStats {
  total_submissions: number;
  submitted_count: number;
  interviewing_count: number;
  accepted_count: number;
  rejected_count: number;
  average_rate: number;
}
import { User, Consultant, Company, Submission, SubmissionStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new ApiError(response.status, error.error || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Network error');
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setToken(response.token);
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  // Consultant endpoints
  async getConsultants(): Promise<Consultant[]> {
    return this.request<Consultant[]>('/consultants');
  }

  async getConsultant(id: number): Promise<Consultant> {
    return this.request<Consultant>(`/consultants/${id}`);
  }

  async createConsultant(data: Partial<Consultant>): Promise<Consultant> {
    return this.request<Consultant>('/consultants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateConsultant(id: number, data: Partial<Consultant>): Promise<Consultant> {
    return this.request<Consultant>(`/consultants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteConsultant(id: number): Promise<void> {
    await this.request(`/consultants/${id}`, { method: 'DELETE' });
  }

  // Company endpoints
  async getCompanies(): Promise<Company[]> {
    return this.request<Company[]>('/companies');
  }

  async createCompany(data: Partial<Company>): Promise<Company> {
    return this.request<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCompany(id: number, data: Partial<Company>): Promise<Company> {
    return this.request<Company>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCompany(id: number): Promise<void> {
    await this.request(`/companies/${id}`, { method: 'DELETE' });
  }

  // Submission endpoints
  async getSubmissions(filters?: {
    consultant_id?: number;
    company_id?: number;
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<Submission[]> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    
    const endpoint = `/submissions${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<Submission[]>(endpoint);
  }

  async createSubmission(data: Partial<Submission>): Promise<Submission> {
    return this.request<Submission>('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSubmission(id: number, data: Partial<Submission>): Promise<Submission> {
    return this.request<Submission>(`/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSubmission(id: number): Promise<void> {
    await this.request(`/submissions/${id}`, { method: 'DELETE' });
  }

  async getSubmissionStats(): Promise<SubmissionStats> {
    return this.request<SubmissionStats>('/submissions/stats');
  }
}

export const api = new ApiClient();
export { ApiError };
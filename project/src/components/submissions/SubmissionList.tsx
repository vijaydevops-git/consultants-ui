import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Modal } from '../ui/Modal';
import { api } from '../../lib/api';
import { Submission, Consultant, Company } from '../../types';
import { formatDate, formatCurrency, getStatusColor } from '../../lib/utils';
import { 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  ExternalLink,
  Calendar,
  DollarSign,
  Building2,
  User
} from 'lucide-react';

export function SubmissionList() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    consultant_id: '',
    company_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [submissionsData, consultantsData, companiesData] = await Promise.all([
        api.getSubmissions(),
        api.getConsultants(),
        api.getCompanies()
      ]);
      
      setSubmissions(submissionsData);
      setConsultants(consultantsData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      try {
        await api.deleteSubmission(id);
        setSubmissions(submissions.filter(s => s.id !== id));
      } catch (error) {
        console.error('Error deleting submission:', error);
      }
    }
  };

  const handleEdit = (submission: Submission) => {
    setEditingSubmission(submission);
  };

  const handleUpdateSubmission = async (data: Partial<Submission>) => {
    if (!editingSubmission) return;
    
    try {
      const updated = await api.updateSubmission(editingSubmission.id, data);
      setSubmissions(submissions.map(s => 
        s.id === editingSubmission.id ? { ...s, ...updated } : s
      ));
      setEditingSubmission(null);
    } catch (error) {
      console.error('Error updating submission:', error);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.position_title.toLowerCase().includes(filters.search.toLowerCase()) ||
      submission.consultant_first_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      submission.consultant_last_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      submission.company_name?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || submission.status === filters.status;
    const matchesConsultant = !filters.consultant_id || submission.consultant_id.toString() === filters.consultant_id;
    const matchesCompany = !filters.company_id || submission.company_id.toString() === filters.company_id;
    
    return matchesSearch && matchesStatus && matchesConsultant && matchesCompany;
  });

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'interviewing', label: 'Interviewing' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'withdrawn', label: 'Withdrawn' }
  ];

  const consultantOptions = [
    { value: '', label: 'All Consultants' },
    ...consultants.map(c => ({ 
      value: c.id.toString(), 
      label: `${c.first_name} ${c.last_name}` 
    }))
  ];

  const companyOptions = [
    { value: '', label: 'All Companies' },
    ...companies.map(c => ({ 
      value: c.id.toString(), 
      label: c.name 
    }))
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Submissions</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {filteredSubmissions.length} of {submissions.length} submissions
          </span>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search submissions..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select
              options={statusOptions}
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            />
            <Select
              options={consultantOptions}
              value={filters.consultant_id}
              onChange={(e) => setFilters({ ...filters, consultant_id: e.target.value })}
            />
            <Select
              options={companyOptions}
              value={filters.company_id}
              onChange={(e) => setFilters({ ...filters, company_id: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredSubmissions.map((submission) => (
          <Card key={submission.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {submission.position_title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{submission.consultant_first_name} {submission.consultant_last_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Building2 className="w-4 h-4" />
                      <span>{submission.company_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(submission.submission_date)}</span>
                    </div>
                    {submission.rate_submitted && (
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatCurrency(submission.rate_submitted)}/hr</span>
                      </div>
                    )}
                  </div>
                  
                  {submission.notes && (
                    <p className="text-sm text-gray-500 mt-2">{submission.notes}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(submission)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(submission.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubmissions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No submissions found matching your criteria.</p>
        </div>
      )}

      {/* Edit Modal */}
      {editingSubmission && (
        <EditSubmissionModal
          submission={editingSubmission}
          consultants={consultants}
          companies={companies}
          onClose={() => setEditingSubmission(null)}
          onSave={handleUpdateSubmission}
        />
      )}
    </div>
  );
}

interface EditSubmissionModalProps {
  submission: Submission;
  consultants: Consultant[];
  companies: Company[];
  onClose: () => void;
  onSave: (data: Partial<Submission>) => void;
}

function EditSubmissionModal({ submission, consultants, companies, onClose, onSave }: EditSubmissionModalProps) {
  const [formData, setFormData] = useState({
    consultant_id: submission.consultant_id,
    company_id: submission.company_id,
    position_title: submission.position_title,
    submission_date: submission.submission_date.split('T')[0],
    status: submission.status,
    rate_submitted: submission.rate_submitted || '',
    notes: submission.notes || '',
    interview_date: submission.interview_date ? submission.interview_date.split('T')[0] : '',
    feedback: submission.feedback || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Edit Submission" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Consultant"
            options={consultants.map(c => ({ 
              value: c.id.toString(), 
              label: `${c.first_name} ${c.last_name}` 
            }))}
            value={formData.consultant_id.toString()}
            onChange={(e) => setFormData({ ...formData, consultant_id: parseInt(e.target.value) })}
            required
          />
          
          <Select
            label="Company"
            options={companies.map(c => ({ 
              value: c.id.toString(), 
              label: c.name 
            }))}
            value={formData.company_id.toString()}
            onChange={(e) => setFormData({ ...formData, company_id: parseInt(e.target.value) })}
            required
          />
        </div>

        <Input
          label="Position Title"
          value={formData.position_title}
          onChange={(e) => setFormData({ ...formData, position_title: e.target.value })}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Submission Date"
            type="date"
            value={formData.submission_date}
            onChange={(e) => setFormData({ ...formData, submission_date: e.target.value })}
            required
          />
          
          <Select
            label="Status"
            options={[
              { value: 'submitted', label: 'Submitted' },
              { value: 'interviewing', label: 'Interviewing' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'withdrawn', label: 'Withdrawn' }
            ]}
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Rate (per hour)"
            type="number"
            step="0.01"
            value={formData.rate_submitted}
            onChange={(e) => setFormData({ ...formData, rate_submitted: e.target.value })}
            placeholder="150.00"
          />
          
          <Input
            label="Interview Date"
            type="date"
            value={formData.interview_date}
            onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
          />
        </div>

        <Input
          label="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes..."
        />

        <Input
          label="Feedback"
          value={formData.feedback}
          onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
          placeholder="Interview feedback..."
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
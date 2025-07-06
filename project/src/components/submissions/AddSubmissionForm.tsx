import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { api } from '../../lib/api';
import { Consultant, Company } from '../../types';
import { PlusCircle, CheckCircle } from 'lucide-react';

export function AddSubmissionForm() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    consultant_id: '',
    company_id: '',
    position_title: '',
    submission_date: new Date().toISOString().split('T')[0],
    rate_submitted: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [consultantsData, companiesData] = await Promise.all([
        api.getConsultants(),
        api.getCompanies()
      ]);
      
      setConsultants(consultantsData);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load form data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await api.createSubmission({
        consultant_id: parseInt(formData.consultant_id),
        company_id: parseInt(formData.company_id),
        position_title: formData.position_title,
        submission_date: formData.submission_date,
        rate_submitted: formData.rate_submitted ? parseFloat(formData.rate_submitted) : undefined,
        notes: formData.notes
      });

      setSuccess(true);
      setFormData({
        consultant_id: '',
        company_id: '',
        position_title: '',
        submission_date: new Date().toISOString().split('T')[0],
        rate_submitted: '',
        notes: ''
      });

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const consultantOptions = [
    { value: '', label: 'Select a consultant' },
    ...consultants.map(c => ({ 
      value: c.id.toString(), 
      label: `${c.first_name} ${c.last_name}` 
    }))
  ];

  const companyOptions = [
    { value: '', label: 'Select a company' },
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
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Add New Submission</h2>
        <p className="text-gray-600">
          Submit a consultant to a company for a specific position.
        </p>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-green-800 font-medium">Submission created successfully!</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Submission Details</h3>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Consultant *"
                options={consultantOptions}
                value={formData.consultant_id}
                onChange={(e) => setFormData({ ...formData, consultant_id: e.target.value })}
                required
              />
              
              <Select
                label="Company *"
                options={companyOptions}
                value={formData.company_id}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                required
              />
            </div>

            <Input
              label="Position Title *"
              value={formData.position_title}
              onChange={(e) => setFormData({ ...formData, position_title: e.target.value })}
              placeholder="Senior Full Stack Developer"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Submission Date *"
                type="date"
                value={formData.submission_date}
                onChange={(e) => setFormData({ ...formData, submission_date: e.target.value })}
                required
              />
              
              <Input
                label="Rate (per hour)"
                type="number"
                step="0.01"
                value={formData.rate_submitted}
                onChange={(e) => setFormData({ ...formData, rate_submitted: e.target.value })}
                placeholder="150.00"
              />
            </div>

            <Input
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about this submission..."
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({
                  consultant_id: '',
                  company_id: '',
                  position_title: '',
                  submission_date: new Date().toISOString().split('T')[0],
                  rate_submitted: '',
                  notes: ''
                })}
              >
                Clear Form
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Submission
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
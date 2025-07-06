import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Modal } from '../ui/Modal';
import { api } from '../../lib/api';
import { Consultant } from '../../types';
import { formatCurrency, getAvailabilityColor } from '../../lib/utils';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin,
  Star
} from 'lucide-react';

export function ConsultantList() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingConsultant, setEditingConsultant] = useState<Consultant | null>(null);

  useEffect(() => {
    fetchConsultants();
  }, []);

  const fetchConsultants = async () => {
    try {
      const data = await api.getConsultants();
      setConsultants(data);
    } catch (error) {
      console.error('Error fetching consultants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this consultant?')) {
      try {
        await api.deleteConsultant(id);
        setConsultants(consultants.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting consultant:', error);
      }
    }
  };

  const handleSave = async (data: Partial<Consultant>) => {
    try {
      if (editingConsultant) {
        const updated = await api.updateConsultant(editingConsultant.id, data);
        setConsultants(consultants.map(c => 
          c.id === editingConsultant.id ? updated : c
        ));
        setEditingConsultant(null);
      } else {
        const newConsultant = await api.createConsultant(data);
        setConsultants([...consultants, newConsultant]);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error saving consultant:', error);
    }
  };

  const filteredConsultants = consultants.filter(consultant =>
    consultant.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultant.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    consultant.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Consultants</h2>
          <p className="text-gray-600">Manage your consultant network</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Consultant
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900">
                {filteredConsultants.length} Consultants
              </h3>
            </div>
            <div className="w-64">
              <Input
                placeholder="Search consultants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConsultants.map((consultant) => (
              <Card key={consultant.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          {consultant.first_name} {consultant.last_name}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(consultant.availability_status)}`}>
                          {consultant.availability_status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingConsultant(consultant)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(consultant.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        {consultant.email}
                      </div>
                      {consultant.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {consultant.phone}
                        </div>
                      )}
                      {consultant.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {consultant.location}
                        </div>
                      )}
                    </div>

                    {consultant.skills.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-1">
                          {consultant.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                            >
                              {skill}
                            </span>
                          ))}
                          {consultant.skills.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                              +{consultant.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      {consultant.experience_years && (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-gray-600">{consultant.experience_years} years</span>
                        </div>
                      )}
                      {consultant.rate_per_hour && (
                        <span className="font-medium text-gray-900">
                          {formatCurrency(consultant.rate_per_hour)}/hr
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredConsultants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No consultants found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      {showAddModal && (
        <ConsultantModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleSave}
          title="Add New Consultant"
        />
      )}

      {/* Edit Modal */}
      {editingConsultant && (
        <ConsultantModal
          isOpen={!!editingConsultant}
          onClose={() => setEditingConsultant(null)}
          onSave={handleSave}
          consultant={editingConsultant}
          title="Edit Consultant"
        />
      )}
    </div>
  );
}

interface ConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Consultant>) => void;
  consultant?: Consultant;
  title: string;
}

function ConsultantModal({ isOpen, onClose, onSave, consultant, title }: ConsultantModalProps) {
  const [formData, setFormData] = useState({
    first_name: consultant?.first_name || '',
    last_name: consultant?.last_name || '',
    email: consultant?.email || '',
    phone: consultant?.phone || '',
    skills: consultant?.skills.join(', ') || '',
    experience_years: consultant?.experience_years || '',
    rate_per_hour: consultant?.rate_per_hour || '',
    availability_status: consultant?.availability_status || 'available',
    location: consultant?.location || '',
    notes: consultant?.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0),
      experience_years: formData.experience_years ? parseInt(formData.experience_years.toString()) : undefined,
      rate_per_hour: formData.rate_per_hour ? parseFloat(formData.rate_per_hour.toString()) : undefined
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name *"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            required
          />
          <Input
            label="Last Name *"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            required
          />
        </div>

        <Input
          label="Email *"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <Input
          label="Skills (comma-separated)"
          value={formData.skills}
          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
          placeholder="React, Node.js, Python, AWS"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Experience (years)"
            type="number"
            value={formData.experience_years}
            onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
          />
          <Input
            label="Rate (per hour)"
            type="number"
            step="0.01"
            value={formData.rate_per_hour}
            onChange={(e) => setFormData({ ...formData, rate_per_hour: e.target.value })}
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Availability</label>
            <select
              value={formData.availability_status}
              onChange={(e) => setFormData({ ...formData, availability_status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="available">Available</option>
              <option value="busy">Busy</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        <Input
          label="Notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes..."
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {consultant ? 'Update' : 'Create'} Consultant
          </Button>
        </div>
      </form>
    </Modal>
  );
}
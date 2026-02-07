import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import { Tenant, Apartment, PaymentFrequency } from '../types';
import { Button, Card, Input, Modal, Select, Badge } from '../components/UI';
import { Plus, User, Phone, Mail, Home, Trash2, Edit2 } from 'lucide-react';

export const Tenants = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Tenant>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTenants(DB.tenants.getAll());
    setApartments(DB.apartments.getAll());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingId) {
      DB.tenants.update(editingId, formData);
    } else {
      DB.tenants.add(formData as Omit<Tenant, 'id'>);
    }
    
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({});
    loadData();
  };

  const handleEdit = (tenant: Tenant) => {
    setFormData(tenant);
    setEditingId(tenant.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this tenant?')) {
      DB.tenants.delete(id);
      loadData();
    }
  };

  const getApartmentName = (id?: string) => {
    if (!id) return 'Unassigned';
    return apartments.find(a => a.id === id)?.name || 'Unknown';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tenants</h2>
          <p className="text-gray-500">Manage leases and tenant details</p>
        </div>
        <Button onClick={() => { setEditingId(null); setFormData({}); setIsModalOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Tenant
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apartment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rent</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lease</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tenants.map(tenant => (
              <tr key={tenant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 flex flex-col space-y-1">
                    <div className="flex items-center"><Mail className="w-3 h-3 mr-1" /> {tenant.email}</div>
                    <div className="flex items-center"><Phone className="w-3 h-3 mr-1" /> {tenant.phone}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {tenant.apartmentId ? (
                     <Badge color="blue">{getApartmentName(tenant.apartmentId)}</Badge>
                  ) : (
                    <Badge color="gray">Unassigned</Badge>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  €{tenant.rentAmount} <span className="text-gray-500 text-xs">/{tenant.paymentFrequency === PaymentFrequency.MONTHLY ? 'mo' : 'yr'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>Since: {new Date(tenant.moveInDate).toLocaleDateString()}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(tenant)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                  <button onClick={() => handleDelete(tenant.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No tenants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Tenant' : 'Add New Tenant'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Email" type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} required />
            <Input label="Phone" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          
          <Select 
            label="Assigned Apartment"
            value={formData.apartmentId || ''}
            onChange={e => setFormData({...formData, apartmentId: e.target.value})}
            options={[
              { label: 'Unassigned', value: '' },
              ...apartments.map(a => ({ label: a.name, value: a.id }))
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Rent Amount" type="number" value={formData.rentAmount || ''} onChange={e => setFormData({...formData, rentAmount: Number(e.target.value)})} />
            <Select 
              label="Frequency"
              value={formData.paymentFrequency || PaymentFrequency.MONTHLY}
              onChange={e => setFormData({...formData, paymentFrequency: e.target.value as PaymentFrequency})}
              options={[
                { label: 'Monthly', value: PaymentFrequency.MONTHLY },
                { label: 'Quarterly', value: PaymentFrequency.QUARTERLY },
                { label: 'Yearly', value: PaymentFrequency.YEARLY }
              ]}
            />
          </div>

          <Input label="Move In Date" type="date" value={formData.moveInDate || ''} onChange={e => setFormData({...formData, moveInDate: e.target.value})} required />
          
          <div className="flex justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="mr-2">Cancel</Button>
            <Button type="submit">Save Tenant</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
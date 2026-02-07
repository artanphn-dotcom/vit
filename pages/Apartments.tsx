import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import { Apartment, Tenant } from '../types';
import { Button, Card, Input, Modal } from '../components/UI';
import { Plus, MapPin, Ruler, Layers, Home, Trash2, Edit2 } from 'lucide-react';

export const Apartments = () => {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Apartment>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setApartments(DB.apartments.getAll());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) return; // Simple validation

    if (editingId) {
      DB.apartments.update(editingId, formData);
    } else {
      DB.apartments.add(formData as Omit<Apartment, 'id'>);
    }
    
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({});
    loadData();
  };

  const handleEdit = (apt: Apartment) => {
    setFormData(apt);
    setEditingId(apt.id);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this apartment?')) {
      DB.apartments.delete(id);
      loadData();
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({});
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Apartments</h2>
          <p className="text-gray-500">Manage your property portfolio</p>
        </div>
        <Button onClick={openNewModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Apartment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apartments.map((apt) => (
          <Card key={apt.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-indigo-600 h-2"></div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{apt.name}</h3>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {apt.address}
                  </div>
                </div>
                <div className="p-2 bg-indigo-50 rounded-full">
                  <Home className="w-5 h-5 text-indigo-600" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-b border-gray-100 py-4 mb-4">
                <div className="text-center">
                  <span className="block text-xs text-gray-400 uppercase tracking-wide">Size</span>
                  <div className="flex items-center justify-center font-semibold text-gray-700">
                    <Ruler className="w-3 h-3 mr-1 text-gray-400" />
                    {apt.size} m²
                  </div>
                </div>
                <div className="text-center border-l border-gray-100">
                  <span className="block text-xs text-gray-400 uppercase tracking-wide">Rooms</span>
                  <div className="flex items-center justify-center font-semibold text-gray-700">
                    {apt.rooms}
                  </div>
                </div>
                <div className="text-center border-l border-gray-100">
                  <span className="block text-xs text-gray-400 uppercase tracking-wide">Floor</span>
                  <div className="flex items-center justify-center font-semibold text-gray-700">
                    <Layers className="w-3 h-3 mr-1 text-gray-400" />
                    {apt.floor}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(apt)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(apt.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {apartments.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
            <Home className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p>No apartments found. Add your first property!</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Apartment' : 'Add New Apartment'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Name / Number" 
            placeholder="e.g. Sunset Apt 101" 
            value={formData.name || ''} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required 
          />
          <Input 
            label="Address" 
            placeholder="123 Main St" 
            value={formData.address || ''} 
            onChange={e => setFormData({...formData, address: e.target.value})} 
            required 
          />
          <div className="grid grid-cols-3 gap-4">
            <Input 
              label="Size (m²)" 
              type="number" 
              value={formData.size || ''} 
              onChange={e => setFormData({...formData, size: Number(e.target.value)})} 
            />
             <Input 
              label="Rooms" 
              type="number" 
              value={formData.rooms || ''} 
              onChange={e => setFormData({...formData, rooms: Number(e.target.value)})} 
            />
             <Input 
              label="Floor" 
              type="number" 
              value={formData.floor || ''} 
              onChange={e => setFormData({...formData, floor: Number(e.target.value)})} 
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea 
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
              rows={3}
              value={formData.notes || ''}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>
          <div className="flex justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="mr-2">Cancel</Button>
            <Button type="submit">{editingId ? 'Save Changes' : 'Create Apartment'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
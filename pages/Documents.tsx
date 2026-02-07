import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import { DocumentFile, DocumentType, Apartment } from '../types';
import { Button, Card, Select, Input, Modal, Badge } from '../components/UI';
import { FileText, Download, Trash2, UploadCloud, Plus } from 'lucide-react';

export const Documents = () => {
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<DocumentFile>>({ type: DocumentType.CONTRACT });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setDocuments(DB.documents.getAll());
    setApartments(DB.apartments.getAll());
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate file upload
    const newDoc: Omit<DocumentFile, 'id'> = {
      name: formData.name || 'Untitled Document',
      type: formData.type || DocumentType.OTHER,
      apartmentId: formData.apartmentId,
      uploadDate: new Date().toISOString(),
      size: Math.floor(Math.random() * 1000000) + 50000, // Random size
      url: '#'
    };
    DB.documents.add(newDoc);
    setIsModalOpen(false);
    setFormData({ type: DocumentType.CONTRACT });
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this document?')) {
      DB.documents.delete(id);
      loadData();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Documents</h2>
          <p className="text-gray-500">Contracts, bills, and property files</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map(doc => (
          <Card key={doc.id} className="p-4 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 truncate max-w-[150px]" title={doc.name}>{doc.name}</h4>
                  <p className="text-xs text-gray-500">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                </div>
              </div>
              <Badge color={doc.type === DocumentType.CONTRACT ? 'blue' : 'gray'}>{doc.type}</Badge>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-xs text-gray-400">
                {doc.apartmentId ? apartments.find(a => a.id === doc.apartmentId)?.name : 'Global'} • {formatSize(doc.size)}
              </div>
              <div className="flex space-x-2">
                <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(doc.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        
        {/* Upload Placeholder */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-indigo-500 hover:text-indigo-500 transition-colors h-32 md:h-auto"
        >
          <UploadCloud className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Click to Upload</span>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload Document">
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center bg-gray-50">
             <FileText className="w-10 h-10 mx-auto text-gray-400 mb-2" />
             <p className="text-sm text-gray-600">Drag and drop files here, or click to browse</p>
             <p className="text-xs text-gray-400 mt-1">PDF, JPG up to 10MB</p>
             {/* Mock File Input */}
             <input type="file" className="hidden" id="file-upload" />
             <label htmlFor="file-upload" className="mt-4 inline-block px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">Select File</label>
          </div>
          
          <Input label="Display Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Tenancy Agreement 2023" required />
          
          <Select 
            label="Document Type"
            value={formData.type || DocumentType.OTHER}
            onChange={e => setFormData({...formData, type: e.target.value as DocumentType})}
            options={[
              { label: 'Contract', value: DocumentType.CONTRACT },
              { label: 'Utility Bill', value: DocumentType.BILL },
              { label: 'Other', value: DocumentType.OTHER }
            ]}
          />

          <Select 
            label="Related Apartment"
            value={formData.apartmentId || ''}
            onChange={e => setFormData({...formData, apartmentId: e.target.value})}
            options={[
              { label: 'None / Global', value: '' },
              ...apartments.map(a => ({ label: a.name, value: a.id }))
            ]}
          />

          <div className="flex justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="mr-2">Cancel</Button>
            <Button type="submit">Save Document</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
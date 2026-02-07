import React, { useState, useEffect } from 'react';
import { DB } from '../services/db';
import { Transaction, TransactionType, ExpenseCategory, Apartment } from '../types';
import { Button, Card, Input, Modal, Select, Badge } from '../components/UI';
import { Plus, ArrowUpCircle, ArrowDownCircle, Filter, Trash2 } from 'lucide-react';

export const Finance = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: TransactionType.EXPENSE,
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    isPaid: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTransactions(DB.transactions.getAll());
    setApartments(DB.apartments.getAll());
  };

  const filteredTransactions = transactions
    .filter(t => filterType === 'ALL' || t.type === filterType)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.category) return;

    DB.transactions.add(formData as Omit<Transaction, 'id'>);
    setIsModalOpen(false);
    setFormData({ type: TransactionType.EXPENSE, date: new Date().toISOString().split('T')[0], isRecurring: false, isPaid: true });
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this transaction?')) {
      DB.transactions.delete(id);
      loadData();
    }
  };

  const getApartmentName = (id?: string) => apartments.find(a => a.id === id)?.name || '-';

  const formatCategoryLabel = (cat: string) => {
    return cat.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div>
       <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Finance</h2>
          <p className="text-gray-500">Track income, expenses, utility bills and family support</p>
        </div>
        <div className="flex space-x-2">
          <div className="flex bg-white border border-gray-300 rounded-md overflow-hidden">
            <button 
              onClick={() => setFilterType('ALL')}
              className={`px-4 py-2 text-sm font-medium ${filterType === 'ALL' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilterType(TransactionType.INCOME)}
              className={`px-4 py-2 text-sm font-medium ${filterType === TransactionType.INCOME ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Income
            </button>
            <button 
              onClick={() => setFilterType(TransactionType.EXPENSE)}
              className={`px-4 py-2 text-sm font-medium ${filterType === TransactionType.EXPENSE ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Expenses
            </button>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Apartment</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map(t => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(t.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {t.type === TransactionType.INCOME ? (
                    <Badge color="green">Income</Badge>
                  ) : (
                    <Badge color="red">Expense</Badge>
                  )}
                  <span className="ml-2 text-xs text-gray-400">{formatCategoryLabel(t.category)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {t.description}
                  {t.isRecurring && <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Recurring</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getApartmentName(t.apartmentId)}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'}€{t.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                   <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                     <Trash2 className="w-4 h-4" />
                   </button>
                </td>
              </tr>
            ))}
             {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Transaction">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-4 mb-4">
            <label className={`flex-1 cursor-pointer border rounded-md p-3 text-center transition-colors ${formData.type === TransactionType.INCOME ? 'bg-green-50 border-green-500 text-green-700 font-bold' : 'hover:bg-gray-50'}`}>
              <input type="radio" className="hidden" name="type" onClick={() => setFormData({...formData, type: TransactionType.INCOME, category: ExpenseCategory.RENT})} />
              Income
            </label>
            <label className={`flex-1 cursor-pointer border rounded-md p-3 text-center transition-colors ${formData.type === TransactionType.EXPENSE ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'hover:bg-gray-50'}`}>
              <input type="radio" className="hidden" name="type" onClick={() => setFormData({...formData, type: TransactionType.EXPENSE, category: ExpenseCategory.MAINTENANCE})} />
              Expense
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            <Input label="Amount (€)" type="number" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} required />
          </div>

          <Select 
            label="Category"
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value as ExpenseCategory})}
            options={
              formData.type === TransactionType.INCOME 
              ? [{ label: 'Rent', value: ExpenseCategory.RENT }, { label: 'Other', value: ExpenseCategory.OTHER }]
              : Object.values(ExpenseCategory).filter(c => c !== ExpenseCategory.RENT).map(c => ({ label: formatCategoryLabel(c), value: c }))
            }
          />

          <Select 
            label="Apartment (Optional)"
            value={formData.apartmentId || ''}
            onChange={e => setFormData({...formData, apartmentId: e.target.value})}
            options={[
              { label: 'General / Global', value: '' },
              ...apartments.map(a => ({ label: a.name, value: a.id }))
            ]}
          />

          <Input label="Description" value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} required />

          <div className="flex items-center space-x-2 pt-2">
             <input type="checkbox" id="recurring" checked={formData.isRecurring} onChange={e => setFormData({...formData, isRecurring: e.target.checked})} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
             <label htmlFor="recurring" className="text-sm text-gray-700">Recurring Transaction (Monthly)</label>
          </div>

           <div className="flex justify-end pt-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="mr-2">Cancel</Button>
            <Button type="submit">Save Entry</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
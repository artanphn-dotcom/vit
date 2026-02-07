import { Apartment, Tenant, Transaction, DocumentFile, TransactionType, ExpenseCategory, PaymentFrequency, DocumentType } from '../types';

const STORAGE_KEYS = {
  APARTMENTS: 'pm_apartments',
  TENANTS: 'pm_tenants',
  TRANSACTIONS: 'pm_transactions',
  DOCUMENTS: 'pm_documents'
};

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock Seed Data
const seedData = () => {
  if (localStorage.getItem(STORAGE_KEYS.APARTMENTS)) return;

  const apt1 = { id: 'apt_1', name: 'Sunset Apt 101', address: '123 Sunset Blvd', size: 85, rooms: 3, floor: 1, notes: 'Renovated in 2023' };
  const apt2 = { id: 'apt_2', name: 'Downtown Loft 4B', address: '45 Main St', size: 120, rooms: 2, floor: 4, notes: 'Luxury finish' };
  
  const tenant1 = { 
    id: 'ten_1', name: 'John Doe', email: 'john@example.com', phone: '555-0101', 
    apartmentId: apt1.id, moveInDate: '2023-01-01', rentAmount: 1200, paymentFrequency: PaymentFrequency.MONTHLY 
  };

  const transactions: Transaction[] = [
    { id: 'tx_1', date: '2023-10-01', amount: 1200, type: TransactionType.INCOME, category: ExpenseCategory.RENT, description: 'Oct Rent - Sunset', apartmentId: apt1.id, isRecurring: true, isPaid: true },
    { id: 'tx_2', date: '2023-10-05', amount: 450, type: TransactionType.EXPENSE, category: ExpenseCategory.MAINTENANCE, description: 'Plumbing Repair', apartmentId: apt1.id, isRecurring: false, isPaid: true },
    { id: 'tx_3', date: '2023-11-01', amount: 1200, type: TransactionType.INCOME, category: ExpenseCategory.RENT, description: 'Nov Rent - Sunset', apartmentId: apt1.id, isRecurring: true, isPaid: true },
    { id: 'tx_4', date: '2023-11-01', amount: 150, type: TransactionType.EXPENSE, category: ExpenseCategory.ELECTRICITY, description: 'Nov Electric', apartmentId: apt1.id, isRecurring: true, isPaid: false },
  ];

  localStorage.setItem(STORAGE_KEYS.APARTMENTS, JSON.stringify([apt1, apt2]));
  localStorage.setItem(STORAGE_KEYS.TENANTS, JSON.stringify([tenant1]));
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
};

seedData();

// Generic CRUD helper
const getItems = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveItems = <T>(key: string, items: T[]) => {
  localStorage.setItem(key, JSON.stringify(items));
};

export const DB = {
  apartments: {
    getAll: () => getItems<Apartment>(STORAGE_KEYS.APARTMENTS),
    add: (item: Omit<Apartment, 'id'>) => {
      const items = getItems<Apartment>(STORAGE_KEYS.APARTMENTS);
      const newItem = { ...item, id: generateId() };
      saveItems(STORAGE_KEYS.APARTMENTS, [...items, newItem]);
      return newItem;
    },
    update: (id: string, updates: Partial<Apartment>) => {
      const items = getItems<Apartment>(STORAGE_KEYS.APARTMENTS);
      const updated = items.map(i => i.id === id ? { ...i, ...updates } : i);
      saveItems(STORAGE_KEYS.APARTMENTS, updated);
    },
    delete: (id: string) => {
      const items = getItems<Apartment>(STORAGE_KEYS.APARTMENTS);
      saveItems(STORAGE_KEYS.APARTMENTS, items.filter(i => i.id !== id));
    }
  },
  tenants: {
    getAll: () => getItems<Tenant>(STORAGE_KEYS.TENANTS),
    add: (item: Omit<Tenant, 'id'>) => {
      const items = getItems<Tenant>(STORAGE_KEYS.TENANTS);
      const newItem = { ...item, id: generateId() };
      saveItems(STORAGE_KEYS.TENANTS, [...items, newItem]);
      return newItem;
    },
    update: (id: string, updates: Partial<Tenant>) => {
      const items = getItems<Tenant>(STORAGE_KEYS.TENANTS);
      const updated = items.map(i => i.id === id ? { ...i, ...updates } : i);
      saveItems(STORAGE_KEYS.TENANTS, updated);
    },
    delete: (id: string) => {
      const items = getItems<Tenant>(STORAGE_KEYS.TENANTS);
      saveItems(STORAGE_KEYS.TENANTS, items.filter(i => i.id !== id));
    }
  },
  transactions: {
    getAll: () => getItems<Transaction>(STORAGE_KEYS.TRANSACTIONS),
    add: (item: Omit<Transaction, 'id'>) => {
      const items = getItems<Transaction>(STORAGE_KEYS.TRANSACTIONS);
      const newItem = { ...item, id: generateId() };
      saveItems(STORAGE_KEYS.TRANSACTIONS, [...items, newItem]);
      return newItem;
    },
    update: (id: string, updates: Partial<Transaction>) => {
      const items = getItems<Transaction>(STORAGE_KEYS.TRANSACTIONS);
      const updated = items.map(i => i.id === id ? { ...i, ...updates } : i);
      saveItems(STORAGE_KEYS.TRANSACTIONS, updated);
    },
    delete: (id: string) => {
      const items = getItems<Transaction>(STORAGE_KEYS.TRANSACTIONS);
      saveItems(STORAGE_KEYS.TRANSACTIONS, items.filter(i => i.id !== id));
    }
  },
  documents: {
    getAll: () => getItems<DocumentFile>(STORAGE_KEYS.DOCUMENTS),
    add: (item: Omit<DocumentFile, 'id'>) => {
      const items = getItems<DocumentFile>(STORAGE_KEYS.DOCUMENTS);
      const newItem = { ...item, id: generateId() };
      saveItems(STORAGE_KEYS.DOCUMENTS, [...items, newItem]);
      return newItem;
    },
    delete: (id: string) => {
      const items = getItems<DocumentFile>(STORAGE_KEYS.DOCUMENTS);
      saveItems(STORAGE_KEYS.DOCUMENTS, items.filter(i => i.id !== id));
    }
  }
};
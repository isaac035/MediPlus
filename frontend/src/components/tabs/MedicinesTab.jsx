import { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { MEDICINE_CATEGORIES } from '../../utils/constants';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { FormInput, FormSelect } from '../common/FormField';

const emptyForm = { name: '', category: '', stockQuantity: '', unitPrice: '' };

export default function MedicinesTab() {
  const { token, isAdmin } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/medicines', token);
      setMedicines(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((med) => {
      const matchesSearch = med.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || med.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [medicines, search, categoryFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (med) => {
    setEditingId(med._id);
    setForm({
      name: med.name,
      category: med.category,
      stockQuantity: med.stockQuantity,
      unitPrice: med.unitPrice,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, category, stockQuantity, unitPrice } = form;

    if (!name || !category || stockQuantity === '' || unitPrice === '') {
      setFormError('All fields are required');
      return;
    }
    if (Number(stockQuantity) < 0 || Number(unitPrice) < 0) {
      setFormError('Stock quantity and unit price cannot be negative');
      return;
    }

    const payload = {
      name,
      category,
      stockQuantity: Number(stockQuantity),
      unitPrice: Number(unitPrice),
      status: Number(stockQuantity) > 0 ? 'In Stock' : 'Out of Stock',
    };

    try {
      if (editingId) {
        await api.put(`/api/medicines/${editingId}`, payload, token);
      } else {
        await api.post('/api/medicines', payload, token);
      }
      setShowModal(false);
      fetchMedicines();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine record?')) return;
    try {
      await api.delete(`/api/medicines/${id}`, token);
      fetchMedicines();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Available Medicines</h2>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors w-fit"
          >
            <Plus size={16} /> Add Medicine
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by medicine name..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Categories</option>
          {MEDICINE_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {loading ? (
        <p className="text-slate-500 text-sm">Loading medicines...</p>
      ) : filteredMedicines.length === 0 ? (
        <p className="text-slate-500 text-sm">No medicines found.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Unit Price</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  {isAdmin && <th className="px-4 py-3 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((med) => (
                  <tr key={med._id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-800">{med.name}</td>
                    <td className="px-4 py-3 text-slate-600">{med.category}</td>
                    <td className="px-4 py-3 text-slate-600">{med.stockQuantity}</td>
                    <td className="px-4 py-3 text-slate-600">Rs. {med.unitPrice}</td>
                    <td className="px-4 py-3"><StatusBadge status={med.status} /></td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEditModal(med)} className="text-slate-400 hover:text-emerald-600">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleDelete(med._id)} className="text-slate-400 hover:text-red-600">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <Modal title={editingId ? 'Edit Medicine' : 'Add Medicine'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            {formError && <p className="text-red-600 text-sm mb-3">{formError}</p>}
            <FormInput
              label="Medicine Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Paracetamol"
            />
            <FormSelect
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Select category</option>
              {MEDICINE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </FormSelect>
            <FormInput
              label="Stock Quantity"
              type="number"
              min="0"
              value={form.stockQuantity}
              onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
            />
            <FormInput
              label="Unit Price (Rs.)"
              type="number"
              min="0"
              step="0.01"
              value={form.unitPrice}
              onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
            />
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {editingId ? 'Save Changes' : 'Add Medicine'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

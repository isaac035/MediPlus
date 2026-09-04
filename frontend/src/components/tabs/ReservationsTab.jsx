import { useEffect, useMemo, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import StatusBadge from '../common/StatusBadge';
import { FormInput } from '../common/FormField';

const emptyForm = { customerName: '', contactNumber: '', medicineName: '', quantity: '', pickupDate: '' };

const todayISO = () => new Date().toISOString().split('T')[0];

export default function ReservationsTab() {
  const { token, isAdmin } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/reservations', token);
      setReservations(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => r.medicineName.toLowerCase().includes(search.toLowerCase()));
  }, [reservations, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { customerName, contactNumber, medicineName, quantity, pickupDate } = form;

    if (!customerName || !contactNumber || !medicineName || !quantity || !pickupDate) {
      setFormError('All fields are required');
      return;
    }
    if (!/^\d{10}$/.test(contactNumber)) {
      setFormError('Contact number must be exactly 10 digits');
      return;
    }
    if (Number(quantity) <= 0) {
      setFormError('Quantity must be greater than 0');
      return;
    }
    if (pickupDate < todayISO()) {
      setFormError('Pickup date cannot be in the past');
      return;
    }

    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/api/reservations', { ...form, quantity: Number(quantity) }, token);
      setForm(emptyForm);
      fetchReservations();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/reservations/${id}`, { status }, token);
      fetchReservations();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this reservation?')) return;
    try {
      await api.delete(`/api/reservations/${id}`, token);
      fetchReservations();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Medicine Reservations</h2>

      {!isAdmin && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <h3 className="font-medium text-slate-800 mb-3">Reserve a Medicine</h3>
          <form onSubmit={handleSubmit}>
            {formError && <p className="text-red-600 text-sm mb-3">{formError}</p>}
            <div className="grid sm:grid-cols-2 gap-x-4">
              <FormInput
                label="Your Name"
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="Amara Fernando"
              />
              <FormInput
                label="Contact Number"
                value={form.contactNumber}
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                placeholder="0761234567"
                maxLength={10}
              />
              <FormInput
                label="Medicine Name"
                value={form.medicineName}
                onChange={(e) => setForm({ ...form, medicineName: e.target.value })}
                placeholder="Amoxicillin"
              />
              <FormInput
                label="Quantity"
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
              <FormInput
                label="Pickup Date"
                type="date"
                min={todayISO()}
                value={form.pickupDate}
                onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              {submitting ? 'Reserving...' : 'Reserve Medicine'}
            </button>
          </form>
        </div>
      )}

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by medicine name..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
        />
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {loading ? (
        <p className="text-slate-500 text-sm">Loading reservations...</p>
      ) : filteredReservations.length === 0 ? (
        <p className="text-slate-500 text-sm">No reservations found.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Medicine</th>
                  <th className="px-4 py-3 font-medium">Qty</th>
                  <th className="px-4 py-3 font-medium">Pickup Date</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  {isAdmin && <th className="px-4 py-3 font-medium">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((r) => (
                  <tr key={r._id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-slate-800">{r.customerName}</td>
                    <td className="px-4 py-3 text-slate-600">{r.medicineName}</td>
                    <td className="px-4 py-3 text-slate-600">{r.quantity}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(r.pickupDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{r.contactNumber}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {r.status === 'Reserved' && (
                            <>
                              <button
                                onClick={() => updateStatus(r._id, 'Picked Up')}
                                className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
                              >
                                Picked Up
                              </button>
                              <button
                                onClick={() => updateStatus(r._id, 'Cancelled')}
                                className="text-xs font-medium text-amber-600 hover:text-amber-700"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          <button onClick={() => handleDelete(r._id)} className="text-slate-400 hover:text-red-600">
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
    </div>
  );
}

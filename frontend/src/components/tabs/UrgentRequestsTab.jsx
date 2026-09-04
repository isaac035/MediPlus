import { useEffect, useMemo, useState } from 'react';
import { Search, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { DISTRICTS, URGENCY_LEVELS } from '../../utils/constants';
import StatusBadge from '../common/StatusBadge';
import { FormInput, FormSelect } from '../common/FormField';

const emptyForm = { patientName: '', medicineRequired: '', district: '', urgencyLevel: 'Moderate', contactNumber: '' };

export default function UrgentRequestsTab() {
  const { token, isAdmin } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');

  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/urgent-requests', token);
      setRequests(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch = req.medicineRequired.toLowerCase().includes(search.toLowerCase());
      const matchesUrgency = !urgencyFilter || req.urgencyLevel === urgencyFilter;
      return matchesSearch && matchesUrgency;
    });
  }, [requests, search, urgencyFilter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { patientName, medicineRequired, district, contactNumber } = form;

    if (!patientName || !medicineRequired || !district || !contactNumber) {
      setFormError('All fields are required');
      return;
    }
    if (!/^\d{10}$/.test(contactNumber)) {
      setFormError('Contact number must be exactly 10 digits');
      return;
    }

    setFormError('');
    setSubmitting(true);
    try {
      await api.post('/api/urgent-requests', form, token);
      setForm(emptyForm);
      fetchRequests();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const markFulfilled = async (id) => {
    try {
      await api.put(`/api/urgent-requests/${id}`, { status: 'Fulfilled' }, token);
      fetchRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this urgent request?')) return;
    try {
      await api.delete(`/api/urgent-requests/${id}`, token);
      fetchRequests();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Urgent Medicine Requests</h2>

      {!isAdmin && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <h3 className="font-medium text-slate-800 mb-3">Request Medicine</h3>
          <form onSubmit={handleSubmit}>
            {formError && <p className="text-red-600 text-sm mb-3">{formError}</p>}
            <div className="grid sm:grid-cols-2 gap-x-4">
              <FormInput
                label="Patient Name"
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                placeholder="Kamal Silva"
              />
              <FormInput
                label="Medicine Required"
                value={form.medicineRequired}
                onChange={(e) => setForm({ ...form, medicineRequired: e.target.value })}
                placeholder="Insulin"
              />
              <FormSelect
                label="District"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
              >
                <option value="">Select district</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </FormSelect>
              <FormSelect
                label="Urgency Level"
                value={form.urgencyLevel}
                onChange={(e) => setForm({ ...form, urgencyLevel: e.target.value })}
              >
                {URGENCY_LEVELS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </FormSelect>
              <FormInput
                label="Contact Number"
                value={form.contactNumber}
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                placeholder="0771234567"
                maxLength={10}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

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
        <div className="flex gap-2">
          {['', ...URGENCY_LEVELS].map((level) => (
            <button
              key={level || 'all'}
              onClick={() => setUrgencyFilter(level)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                urgencyFilter === level
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {level || 'All'}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {loading ? (
        <p className="text-slate-500 text-sm">Loading requests...</p>
      ) : filteredRequests.length === 0 ? (
        <p className="text-slate-500 text-sm">No urgent requests found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredRequests.map((req) => (
            <div key={req._id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-slate-800">{req.medicineRequired}</h4>
                <StatusBadge status={req.urgencyLevel} />
              </div>
              <p className="text-sm text-slate-600">Patient: {req.patientName}</p>
              <p className="text-sm text-slate-600">District: {req.district}</p>
              <p className="text-sm text-slate-600">Contact: {req.contactNumber}</p>
              <div className="flex items-center justify-between mt-3">
                <StatusBadge status={req.status} />
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    {req.status !== 'Fulfilled' && (
                      <button
                        onClick={() => markFulfilled(req._id)}
                        className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        <CheckCircle2 size={14} /> Mark Fulfilled
                      </button>
                    )}
                    <button onClick={() => handleDelete(req._id)} className="text-slate-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

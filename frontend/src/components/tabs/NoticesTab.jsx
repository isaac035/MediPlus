import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, HandHeart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../utils/api';
import { DISTRICTS, NOTICE_CATEGORIES } from '../../utils/constants';
import StatusBadge from '../common/StatusBadge';
import Modal from '../common/Modal';
import { FormInput, FormSelect, FormTextarea } from '../common/FormField';

const emptyForm = { title: '', category: 'Blood', district: '', description: '', contactNumber: '' };

export default function NoticesTab() {
  const { token, isAdmin } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const data = await api.get('/api/notices', token);
      setNotices(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const matchesCategory = !categoryFilter || notice.category === categoryFilter;
      const matchesDistrict = !districtFilter || notice.district === districtFilter;
      return matchesCategory && matchesDistrict;
    });
  }, [notices, categoryFilter, districtFilter]);

  const openAddModal = () => {
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { title, category, district, description, contactNumber } = form;

    if (!title || !category || !district || !description || !contactNumber) {
      setFormError('All fields are required');
      return;
    }
    if (!/^\d{10}$/.test(contactNumber)) {
      setFormError('Contact number must be exactly 10 digits');
      return;
    }

    try {
      await api.post('/api/notices', form, token);
      setShowModal(false);
      fetchNotices();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleVolunteer = async (id) => {
    try {
      await api.put(`/api/notices/${id}/volunteer`, {}, token);
      fetchNotices();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await api.delete(`/api/notices/${id}`, token);
      fetchNotices();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Blood & Volunteer Notices</h2>
        {isAdmin && (
          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors w-fit"
          >
            <Plus size={16} /> Post Notice
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex gap-2">
          {['', ...NOTICE_CATEGORIES].map((cat) => (
            <button
              key={cat || 'all'}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                categoryFilter === cat
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat || 'All'}
            </button>
          ))}
        </div>
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">All Districts</option>
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
      {loading ? (
        <p className="text-slate-500 text-sm">Loading notices...</p>
      ) : filteredNotices.length === 0 ? (
        <p className="text-slate-500 text-sm">No notices found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredNotices.map((notice) => (
            <div key={notice._id} className="bg-white border border-slate-200 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-slate-800">{notice.title}</h4>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                  {notice.category}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-2">{notice.description}</p>
              <p className="text-sm text-slate-600">District: {notice.district}</p>
              <p className="text-sm text-slate-600">Contact: {notice.contactNumber}</p>
              <p className="text-sm text-slate-600">Volunteers enrolled: {notice.volunteers.length}</p>
              {isAdmin && notice.volunteers.length > 0 && (
                <p className="text-xs text-slate-500 mb-3">
                  Volunteers: {notice.volunteers.map((v) => v.name).join(', ')}
                </p>
              )}
              <div className="flex items-center justify-between mt-3">
                <StatusBadge status={notice.status} />
                <div className="flex items-center gap-3">
                  {!isAdmin && notice.status === 'Active' && (
                    <button
                      onClick={() => handleVolunteer(notice._id)}
                      className="flex items-center gap-1 text-xs font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      <HandHeart size={14} /> I Want to Help
                    </button>
                  )}
                  {isAdmin && (
                    <button onClick={() => handleDelete(notice._id)} className="text-slate-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Post Notice" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            {formError && <p className="text-red-600 text-sm mb-3">{formError}</p>}
            <FormInput
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Urgent O- Blood Needed"
            />
            <FormSelect
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {NOTICE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </FormSelect>
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
            <FormTextarea
              label="Description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Details about the request..."
            />
            <FormInput
              label="Contact Number"
              value={form.contactNumber}
              onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
              placeholder="0711234567"
              maxLength={10}
            />
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Post Notice
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

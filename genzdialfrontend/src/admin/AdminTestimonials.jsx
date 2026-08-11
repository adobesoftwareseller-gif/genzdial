import { useEffect, useState } from 'react';
import api from '../api.js';
import Loader from './Loader.jsx';

const empty = { name: '', date: '', rating: 10, text: '', order: 0, active: true };

export default function AdminTestimonials() {
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);
    const [fetching, setFetching] = useState(true);

    const load = () => {
        setFetching(true);
        return api.get('/testimonials/all')
            .then((r) => setItems(r.data))
            .finally(() => setFetching(false));
    };
    useEffect(() => { load(); }, []);

    const startNew = () => { setEditing('new'); setForm(empty); };
    const startEdit = (t) => { setEditing(t._id); setForm({ ...empty, ...t }); };
    const cancel = () => { setEditing(null); setForm(empty); };

    const save = async (e) => {
        e.preventDefault();
        try {
            if (editing === 'new') await api.post('/testimonials', form);
            else await api.put(`/testimonials/${editing}`, form);
            await load();
            cancel();
        } catch (err) {
            alert(err.response?.data?.message || 'Save failed');
        }
    };

    const remove = async (id) => {
        if (!confirm('Delete this testimonial?')) return;
        await api.delete(`/testimonials/${id}`);
        load();
    };

    const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    return (
        <div>
            <div className="admin-page-head">
                <h1 className="admin-title">Testimonials</h1>
                <button className="btn-primary" onClick={startNew}>+ Add Testimonial</button>
            </div>

            {editing && (
                <form className="admin-form" onSubmit={save}>
                    <h3>{editing === 'new' ? 'New Testimonial' : 'Edit Testimonial'}</h3>
                    <div className="grid-2">
                        <div>
                            <label>Name</label>
                            <input value={form.name} onChange={(e) => onChange('name', e.target.value)} required />
                        </div>
                        <div>
                            <label>Date (e.g. 20 NOV, 2025)</label>
                            <input value={form.date} onChange={(e) => onChange('date', e.target.value)} />
                        </div>
                        <div>
                            <label>Rating (0-10)</label>
                            <input type="number" min="0" max="10" value={form.rating} onChange={(e) => onChange('rating', +e.target.value)} />
                        </div>
                        <div>
                            <label>Order</label>
                            <input type="number" value={form.order} onChange={(e) => onChange('order', +e.target.value)} />
                        </div>
                        <div className="span-2">
                            <label>Testimonial Text</label>
                            <textarea rows="5" value={form.text} onChange={(e) => onChange('text', e.target.value)} required />
                        </div>
                        <label className="check">
                            <input type="checkbox" checked={form.active} onChange={(e) => onChange('active', e.target.checked)} /> Active
                        </label>
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={cancel}>Cancel</button>
                        <button className="btn-primary">Save</button>
                    </div>
                </form>
            )}

            <div className="banner-list">
                {fetching ? (
                    <Loader label="Loading testimonials…" />
                ) : (
                    <>
                        {items.map((t) => (
                            <div className="banner-card" key={t._id}>
                                <div className="banner-meta" style={{ width: '100%' }}>
                                    <div>
                                        <strong>{t.name}</strong>
                                        <div className="muted" style={{ fontSize: 13 }}>{t.date} · {t.rating}/10</div>
                                        <div style={{ fontSize: 13, marginTop: 6, maxWidth: 600 }}>{t.text}</div>
                                        <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>order: {t.order} · {t.active ? 'active' : 'inactive'}</div>
                                    </div>
                                    <div className="form-actions" style={{ marginTop: 0 }}>
                                        <button onClick={() => startEdit(t)}>Edit</button>
                                        <button className="btn-danger" onClick={() => remove(t._id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && <p className="muted">No testimonials yet. Add one above.</p>}
                    </>
                )}
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import api from '../api.js';
import Loader from './Loader.jsx';

const empty = { question: '', answer: '', order: 0, active: true };

export default function AdminFaqs() {
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);
    const [fetching, setFetching] = useState(true);

    const load = () => {
        setFetching(true);
        return api.get('/faqs/all')
            .then((r) => setItems(r.data))
            .finally(() => setFetching(false));
    };
    useEffect(() => { load(); }, []);

    const startNew = () => { setEditing('new'); setForm(empty); };
    const startEdit = (f) => { setEditing(f._id); setForm({ ...empty, ...f }); };
    const cancel = () => { setEditing(null); setForm(empty); };

    const save = async (e) => {
        e.preventDefault();
        try {
            if (editing === 'new') await api.post('/faqs', form);
            else await api.put(`/faqs/${editing}`, form);
            await load();
            cancel();
        } catch (err) {
            alert(err.response?.data?.message || 'Save failed');
        }
    };

    const remove = async (id) => {
        if (!confirm('Delete this FAQ?')) return;
        await api.delete(`/faqs/${id}`);
        load();
    };

    const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    return (
        <div>
            <div className="admin-page-head">
                <h1 className="admin-title">FAQs</h1>
                <button className="btn-primary" onClick={startNew}>+ Add FAQ</button>
            </div>

            {editing && (
                <form className="admin-form" onSubmit={save}>
                    <h3>{editing === 'new' ? 'New FAQ' : 'Edit FAQ'}</h3>
                    <div className="grid-2">
                        <div className="span-2">
                            <label>Question</label>
                            <input value={form.question} onChange={(e) => onChange('question', e.target.value)} required />
                        </div>
                        <div className="span-2">
                            <label>Answer</label>
                            <textarea rows="5" value={form.answer} onChange={(e) => onChange('answer', e.target.value)} required />
                        </div>
                        <div>
                            <label>Order</label>
                            <input type="number" value={form.order} onChange={(e) => onChange('order', +e.target.value)} />
                        </div>
                        <label className="check"><input type="checkbox" checked={form.active} onChange={(e) => onChange('active', e.target.checked)} /> Active</label>
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={cancel}>Cancel</button>
                        <button className="btn-primary">Save</button>
                    </div>
                </form>
            )}

            <div className="banner-list">
                {fetching ? (
                    <Loader label="Loading FAQs…" />
                ) : (
                    <>
                        {items.map((f) => (
                            <div className="banner-card" key={f._id} style={{ gridTemplateColumns: '1fr' }}>
                                <div className="banner-meta" style={{ width: '100%' }}>
                                    <div>
                                        <strong>{f.question}</strong>
                                        <div style={{ fontSize: 13, marginTop: 6, maxWidth: 700, color: '#444' }}>{f.answer}</div>
                                        <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>order: {f.order} · {f.active ? 'active' : 'inactive'}</div>
                                    </div>
                                    <div className="form-actions" style={{ marginTop: 0 }}>
                                        <button onClick={() => startEdit(f)}>Edit</button>
                                        <button className="btn-danger" onClick={() => remove(f._id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && <p className="muted">No FAQs yet. Add one above.</p>}
                    </>
                )}
            </div>
        </div>
    );
}

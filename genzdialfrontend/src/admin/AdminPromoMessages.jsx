import { useEffect, useState } from 'react';
import api from '../api.js';
import Loader from './Loader.jsx';

const empty = { text: '', order: 0, active: true };

export default function AdminPromoMessages() {
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);
    const [fetching, setFetching] = useState(true);

    const load = () => {
        setFetching(true);
        return api.get('/promo-messages/all')
            .then((r) => setItems(r.data))
            .finally(() => setFetching(false));
    };
    useEffect(() => { load(); }, []);

    const startNew = () => { setEditing('new'); setForm(empty); };
    const startEdit = (m) => { setEditing(m._id); setForm({ ...empty, ...m }); };
    const cancel = () => { setEditing(null); setForm(empty); };

    const save = async (e) => {
        e.preventDefault();
        try {
            if (editing === 'new') await api.post('/promo-messages', form);
            else await api.put(`/promo-messages/${editing}`, form);
            await load();
            cancel();
        } catch (err) {
            alert(err.response?.data?.message || 'Save failed');
        }
    };

    const remove = async (id) => {
        if (!confirm('Delete this message?')) return;
        await api.delete(`/promo-messages/${id}`);
        load();
    };

    const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    return (
        <div>
            <div className="admin-page-head">
                <h1 className="admin-title">Top Promo Strip</h1>
                <button className="btn-primary" onClick={startNew}>+ Add Message</button>
            </div>

            {editing && (
                <form className="admin-form" onSubmit={save}>
                    <h3>{editing === 'new' ? 'New Message' : 'Edit Message'}</h3>
                    <div className="grid-2">
                        <div className="span-2">
                            <label>Message text</label>
                            <input value={form.text} onChange={(e) => onChange('text', e.target.value)} placeholder="Free shipping on every order" required />
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
                    <Loader label="Loading messages…" />
                ) : (
                    <>
                        {items.map((m) => (
                            <div className="banner-card" key={m._id} style={{ gridTemplateColumns: '1fr' }}>
                                <div className="banner-meta">
                                    <div>
                                        <strong>{m.text}</strong>
                                        <div className="muted" style={{ fontSize: 12 }}>order: {m.order} · {m.active ? 'active' : 'inactive'}</div>
                                    </div>
                                    <div className="form-actions" style={{ marginTop: 0 }}>
                                        <button onClick={() => startEdit(m)}>Edit</button>
                                        <button className="btn-danger" onClick={() => remove(m._id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && <p className="muted">No messages yet. Add one above.</p>}
                    </>
                )}
            </div>
        </div>
    );
}

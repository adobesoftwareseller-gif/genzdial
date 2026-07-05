import { useEffect, useState } from 'react';
import api from '../api.js';
import Loader from './Loader.jsx';

const empty = { name: '', image: '', link: '', order: 0, active: true };

export default function AdminMediaLogos() {
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);
    const [fetching, setFetching] = useState(true);

    const load = () => {
        setFetching(true);
        return api.get('/media-logos/all')
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
            if (editing === 'new') await api.post('/media-logos', form);
            else await api.put(`/media-logos/${editing}`, form);
            await load();
            cancel();
        } catch (err) {
            alert(err.response?.data?.message || 'Save failed');
        }
    };

    const remove = async (id) => {
        if (!confirm('Delete this logo?')) return;
        await api.delete(`/media-logos/${id}`);
        load();
    };

    const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const onImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => onChange('image', reader.result);
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <div className="admin-page-head">
                <h1 className="admin-title">Media Logos</h1>
                <button className="btn-primary" onClick={startNew}>+ Add Logo</button>
            </div>

            {editing && (
                <form className="admin-form" onSubmit={save}>
                    <h3>{editing === 'new' ? 'New Logo' : 'Edit Logo'}</h3>
                    <div className="grid-2">
                        <div>
                            <label>Name (alt text)</label>
                            <input value={form.name} onChange={(e) => onChange('name', e.target.value)} placeholder="Hindustan Times" />
                        </div>
                        <div>
                            <label>Link (optional)</label>
                            <input value={form.link} onChange={(e) => onChange('link', e.target.value)} placeholder="https://…" />
                        </div>
                        <div>
                            <label>Order</label>
                            <input type="number" value={form.order} onChange={(e) => onChange('order', +e.target.value)} />
                        </div>
                        <label className="check"><input type="checkbox" checked={form.active} onChange={(e) => onChange('active', e.target.checked)} /> Active</label>
                        <div className="span-2">
                            <label>Logo image (upload or paste URL)</label>
                            <input value={form.image} onChange={(e) => onChange('image', e.target.value)} placeholder="https://… or upload below" />
                            <input type="file" accept="image/*" onChange={onImage} style={{ marginTop: 8 }} />
                            {form.image && <img src={form.image} alt="preview" className="img-preview" />}
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={cancel}>Cancel</button>
                        <button className="btn-primary">Save</button>
                    </div>
                </form>
            )}

            <div className="banner-list">
                {fetching ? (
                    <Loader label="Loading logos…" />
                ) : (
                    <>
                        {items.map((m) => (
                            <div className="banner-card" key={m._id}>
                                <img src={m.image} alt={m.name} style={{ background: '#000', padding: 16 }} />
                                <div className="banner-meta">
                                    <div>
                                        <strong>{m.name || '(no name)'}</strong>
                                        <div className="muted" style={{ fontSize: 12 }}>order: {m.order} · {m.active ? 'active' : 'inactive'}</div>
                                    </div>
                                    <div className="form-actions" style={{ marginTop: 0 }}>
                                        <button onClick={() => startEdit(m)}>Edit</button>
                                        <button className="btn-danger" onClick={() => remove(m._id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {items.length === 0 && <p className="muted">No logos yet. Add one above.</p>}
                    </>
                )}
            </div>
        </div>
    );
}

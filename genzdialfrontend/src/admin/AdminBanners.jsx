import { useEffect, useState } from 'react';
import api, { uploadImage } from '../api.js';
import Loader from './Loader.jsx';

const empty = { title: '', subtitle: '', image: '', link: '/shop', placement: 'hero', order: 0, active: true };

export default function AdminBanners() {
    const [banners, setBanners] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);
    const [fetching, setFetching] = useState(true);

    const load = () => {
        setFetching(true);
        return api.get('/banners/all')
            .then((r) => setBanners(r.data))
            .finally(() => setFetching(false));
    };
    useEffect(() => { load(); }, []);

    const startNew = () => { setEditing('new'); setForm(empty); };
    const startEdit = (b) => { setEditing(b._id); setForm({ ...empty, ...b }); };
    const cancel = () => { setEditing(null); setForm(empty); };

    const save = async (e) => {
        e.preventDefault();
        try {
            if (editing === 'new') await api.post('/banners', form);
            else await api.put(`/banners/${editing}`, form);
            await load();
            cancel();
        } catch (err) {
            alert(err.response?.data?.message || 'Save failed');
        }
    };

    const remove = async (id) => {
        if (!confirm('Delete this banner?')) return;
        await api.delete(`/banners/${id}`);
        load();
    };

    const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const onImage = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const url = await uploadImage(file);
            onChange('image', url);
        } catch (err) {
            alert(err.response?.data?.error || 'Image upload failed');
        }
        e.target.value = '';
    };

    return (
        <div>
            <div className="admin-page-head">
                <h1 className="admin-title">Banners</h1>
                <button className="btn-primary" onClick={startNew}>+ Add Banner</button>
            </div>

            {editing && (
                <form className="admin-form" onSubmit={save}>
                    <h3>{editing === 'new' ? 'New Banner' : 'Edit Banner'}</h3>
                    <div className="grid-2">
                        <div>
                            <label>Title</label>
                            <input value={form.title} onChange={(e) => onChange('title', e.target.value)} />
                        </div>
                        <div>
                            <label>Subtitle</label>
                            <input value={form.subtitle} onChange={(e) => onChange('subtitle', e.target.value)} />
                        </div>
                        <div>
                            <label>Link</label>
                            <input value={form.link} onChange={(e) => onChange('link', e.target.value)} />
                        </div>
                        <div>
                            <label>Order</label>
                            <input type="number" value={form.order} onChange={(e) => onChange('order', +e.target.value)} />
                        </div>
                        <div>
                            <label>Placement</label>
                            <select value={form.placement} onChange={(e) => onChange('placement', e.target.value)}>
                                <option value="hero">Hero (top slider)</option>
                                <option value="mid">Mid (below products)</option>
                            </select>
                        </div>
                        <div className="span-2">
                            <label>Image URL or upload</label>
                            <input value={form.image} onChange={(e) => onChange('image', e.target.value)} placeholder="https://… or upload below" />
                            <input type="file" accept="image/*" onChange={onImage} style={{ marginTop: 8 }} />
                            {form.image && <img src={form.image} alt="preview" className="img-preview wide" />}
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
                    <Loader label="Loading banners…" />
                ) : (
                    <>
                        {banners.map((b) => (
                            <div className="banner-card" key={b._id}>
                                <img src={b.image} alt={b.title} />
                                <div className="banner-meta">
                                    <div>
                                        <strong>{b.title || '(no title)'}</strong>
                                        <div className="muted" style={{ fontSize: 13 }}>{b.subtitle}</div>
                                        <div className="muted" style={{ fontSize: 12 }}>order: {b.order} · {b.placement || 'hero'} · {b.active ? 'active' : 'inactive'}</div>
                                    </div>
                                    <div className="form-actions" style={{ marginTop: 0 }}>
                                        <button onClick={() => startEdit(b)}>Edit</button>
                                        <button className="btn-danger" onClick={() => remove(b._id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {banners.length === 0 && <p className="muted">No banners yet. Add one above.</p>}
                    </>
                )}
            </div>
        </div>
    );
}

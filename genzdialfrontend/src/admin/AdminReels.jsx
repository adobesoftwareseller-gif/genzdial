import { useEffect, useRef, useState } from 'react';
import api, { assetUrl } from '../api.js';
import Loader from './Loader.jsx';

const empty = { video: '', poster: '', link: '/shop', label: 'Shop Now', order: 0, active: true };
const MAX_REELS = 10;

export default function AdminReels() {
    const [reels, setReels] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [fetching, setFetching] = useState(true);
    const fileRef = useRef(null);

    const load = () => {
        setFetching(true);
        return api.get('/reels/all')
            .then((r) => setReels(r.data))
            .finally(() => setFetching(false));
    };
    useEffect(() => { load(); }, []);

    const startNew = () => {
        if (reels.length >= MAX_REELS) {
            alert(`Maximum ${MAX_REELS} reels allowed. Delete one before adding a new one.`);
            return;
        }
        setEditing('new');
        setForm(empty);
    };
    const startEdit = (r) => { setEditing(r._id); setForm({ ...empty, ...r }); };
    const cancel = () => { setEditing(null); setForm(empty); setProgress(0); };

    const save = async (e) => {
        e.preventDefault();
        if (!form.video) { alert('Please upload a video first'); return; }
        try {
            if (editing === 'new') await api.post('/reels', form);
            else await api.put(`/reels/${editing}`, form);
            await load();
            cancel();
        } catch (err) {
            alert(err.response?.data?.error || 'Save failed');
        }
    };

    const remove = async (id) => {
        if (!confirm('Delete this reel?')) return;
        await api.delete(`/reels/${id}`);
        load();
    };

    const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const onVideo = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const data = new FormData();
        data.append('video', file);
        setUploading(true);
        setProgress(0);
        try {
            const res = await api.post('/reels/upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (evt) => {
                    if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
                },
            });
            onChange('video', res.data.url);
        } catch (err) {
            alert(err.response?.data?.error || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const onPoster = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => onChange('poster', reader.result);
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <div className="admin-page-head">
                <h1 className="admin-title">Reels <small className="muted" style={{ fontSize: 14, fontWeight: 400, marginLeft: 10 }}>{reels.length} / {MAX_REELS}</small></h1>
                <button className="btn-primary" onClick={startNew} disabled={reels.length >= MAX_REELS}>+ Add Reel</button>
            </div>

            {editing && (
                <form className="admin-form" onSubmit={save}>
                    <h3>{editing === 'new' ? 'New Reel' : 'Edit Reel'}</h3>
                    <div className="grid-2">
                        <div className="span-2">
                            <label>Video file (mp4/webm, up to 50MB)</label>
                            <input ref={fileRef} type="file" accept="video/*" onChange={onVideo} disabled={uploading} />
                            {uploading && <div className="muted" style={{ marginTop: 6 }}>Uploading… {progress}%</div>}
                            {form.video && !uploading && (
                                <video src={assetUrl(form.video)} controls muted className="img-preview wide" style={{ maxHeight: 220 }} />
                            )}
                        </div>
                        <div>
                            <label>Button label</label>
                            <input value={form.label} onChange={(e) => onChange('label', e.target.value)} />
                        </div>
                        <div>
                            <label>Link (where button takes user)</label>
                            <input value={form.link} onChange={(e) => onChange('link', e.target.value)} placeholder="/shop or https://…" />
                        </div>
                        <div>
                            <label>Order</label>
                            <input type="number" value={form.order} onChange={(e) => onChange('order', +e.target.value)} />
                        </div>
                        <div>
                            <label>Poster image (optional)</label>
                            <input type="file" accept="image/*" onChange={onPoster} />
                            {form.poster && <img src={form.poster} alt="poster" className="img-preview" />}
                        </div>
                        <label className="check"><input type="checkbox" checked={form.active} onChange={(e) => onChange('active', e.target.checked)} /> Active</label>
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={cancel}>Cancel</button>
                        <button className="btn-primary" disabled={uploading}>Save</button>
                    </div>
                </form>
            )}

            <div className="banner-list">
                {fetching ? (
                    <Loader label="Loading reels…" />
                ) : (
                    <>
                        {reels.map((r) => (
                            <div className="banner-card" key={r._id}>
                                <video src={assetUrl(r.video)} muted loop playsInline preload="metadata" style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block', background: '#000' }} />
                                <div className="banner-meta">
                                    <div>
                                        <strong>{r.label || 'Shop Now'}</strong>
                                        <div className="muted" style={{ fontSize: 12 }}>order: {r.order} · {r.active ? 'active' : 'inactive'}</div>
                                        <div className="muted" style={{ fontSize: 12 }}>→ {r.link}</div>
                                    </div>
                                    <div className="form-actions" style={{ marginTop: 0 }}>
                                        <button onClick={() => startEdit(r)}>Edit</button>
                                        <button className="btn-danger" onClick={() => remove(r._id)}>Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {reels.length === 0 && <p className="muted">No reels yet. Add one above.</p>}
                    </>
                )}
            </div>
        </div>
    );
}

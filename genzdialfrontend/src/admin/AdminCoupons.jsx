import { useEffect, useState } from 'react';
import api from '../api.js';
import Loader from './Loader.jsx';

const empty = {
    code: '',
    percent: 10,
    active: true,
    expiresAt: '',
    description: '',
};

const toDateInput = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
};

export default function AdminCoupons() {
    const [items, setItems] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty);
    const [fetching, setFetching] = useState(true);

    const load = () => {
        setFetching(true);
        return api.get('/coupons')
            .then((r) => setItems(r.data))
            .finally(() => setFetching(false));
    };
    useEffect(() => { load(); }, []);

    const startNew = () => { setEditing('new'); setForm(empty); };
    const startEdit = (c) => {
        setEditing(c._id);
        setForm({
            ...empty,
            ...c,
            expiresAt: toDateInput(c.expiresAt),
        });
    };
    const cancel = () => { setEditing(null); setForm(empty); };

    const save = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                code: form.code.trim().toUpperCase(),
                percent: Number(form.percent),
                minSubtotal: 0,
                maxDiscount: 0,
                expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
            };
            if (editing === 'new') await api.post('/coupons', payload);
            else await api.put(`/coupons/${editing}`, payload);
            await load();
            cancel();
        } catch (err) {
            alert(err.response?.data?.message || 'Save failed');
        }
    };

    const remove = async (id) => {
        if (!confirm('Delete this coupon?')) return;
        await api.delete(`/coupons/${id}`);
        load();
    };

    const onChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    return (
        <div>
            <div className="admin-page-head">
                <h1 className="admin-title">Coupons</h1>
                <button className="btn-primary" onClick={startNew}>+ Add Coupon</button>
            </div>

            {editing && (
                <form className="admin-form" onSubmit={save}>
                    <h3>{editing === 'new' ? 'New Coupon' : 'Edit Coupon'}</h3>
                    <div className="grid-2">
                        <div>
                            <label>Code</label>
                            <input
                                value={form.code}
                                onChange={(e) => onChange('code', e.target.value.toUpperCase())}
                                placeholder="e.g. WELCOME10"
                                required
                            />
                        </div>
                        <div>
                            <label>Discount %</label>
                            <input
                                type="number"
                                min={1}
                                max={100}
                                value={form.percent}
                                onChange={(e) => onChange('percent', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label>Expires On</label>
                            <input
                                type="date"
                                value={form.expiresAt}
                                onChange={(e) => onChange('expiresAt', e.target.value)}
                            />
                        </div>
                        <label className="check">
                            <input
                                type="checkbox"
                                checked={form.active}
                                onChange={(e) => onChange('active', e.target.checked)}
                            />{' '}Active
                        </label>
                        <div className="span-2">
                            <label>Description (optional)</label>
                            <input
                                value={form.description}
                                onChange={(e) => onChange('description', e.target.value)}
                                placeholder="Internal note"
                            />
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
                    <Loader label="Loading coupons…" />
                ) : (
                    <>
                        {items.map((c) => {
                            const expired = c.expiresAt && new Date(c.expiresAt).getTime() < Date.now();
                            return (
                                <div className="banner-card" key={c._id} style={{ gridTemplateColumns: '1fr' }}>
                                    <div className="banner-meta" style={{ width: '100%' }}>
                                        <div>
                                            <strong style={{ letterSpacing: 1 }}>{c.code}</strong>{' '}
                                            <span style={{ fontSize: 13, color: '#444' }}>{c.percent}% off</span>
                                            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                                                {c.active ? 'active' : 'inactive'}
                                                {c.expiresAt ? ` · expires ${new Date(c.expiresAt).toLocaleDateString()}` : ''}
                                                {expired ? ' · EXPIRED' : ''}
                                            </div>
                                            {c.description && (
                                                <div style={{ fontSize: 13, marginTop: 6, color: '#444' }}>{c.description}</div>
                                            )}
                                        </div>
                                        <div className="form-actions" style={{ marginTop: 0 }}>
                                            <button onClick={() => startEdit(c)}>Edit</button>
                                            <button className="btn-danger" onClick={() => remove(c._id)}>Delete</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {items.length === 0 && <p className="muted">No coupons yet. Add one above.</p>}
                    </>
                )}
            </div>
        </div>
    );
}

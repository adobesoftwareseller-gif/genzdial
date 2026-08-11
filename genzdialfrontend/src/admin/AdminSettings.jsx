import { useEffect, useState } from 'react';
import api, { assetUrl } from '../api.js';
import Loader from './Loader.jsx';

export default function AdminSettings() {
    const [data, setData] = useState({ paymentQr: '', upiId: '', payeeName: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        api.get('/settings/payment')
            .then((r) => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    const onChange = (k, v) => setData((d) => ({ ...d, [k]: v }));

    const onQrFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('qr', file);
        setUploading(true);
        setMsg('');
        try {
            const res = await api.post('/settings/payment/qr', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setData((d) => ({ ...d, paymentQr: res.data.url }));
            setMsg('QR uploaded');
        } catch (err) {
            alert(err.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const removeQr = async () => {
        if (!confirm('Remove current QR image?')) return;
        try {
            await api.put('/settings/payment', { paymentQr: '' });
            setData((d) => ({ ...d, paymentQr: '' }));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed');
        }
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg('');
        try {
            await api.put('/settings/payment', {
                upiId: data.upiId,
                payeeName: data.payeeName,
            });
            setMsg('Saved');
        } catch (err) {
            alert(err.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader label="Loading settings…" />;

    return (
        <div>
            <div className="admin-page-head">
                <h1 className="admin-title">Payment Settings</h1>
            </div>

            <form className="admin-form" onSubmit={save}>
                <h3>UPI QR Code</h3>
                <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
                    Upload the QR image customers will scan on checkout.
                </p>

                {data.paymentQr ? (
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                        <img
                            src={assetUrl(data.paymentQr)}
                            alt="Payment QR"
                            style={{ width: 200, height: 200, objectFit: 'contain', border: '1px solid #eee', borderRadius: 8 }}
                        />
                        <div>
                            <button type="button" className="btn-danger" onClick={removeQr}>Remove</button>
                        </div>
                    </div>
                ) : (
                    <p className="muted" style={{ fontSize: 13 }}>No QR uploaded yet.</p>
                )}

                <div style={{ marginBottom: 16 }}>
                    <label>{data.paymentQr ? 'Replace QR' : 'Upload QR'}</label>
                    <input type="file" accept="image/*" onChange={onQrFile} disabled={uploading} />
                    {uploading && <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>Uploading…</div>}
                </div>

                <h3 style={{ marginTop: 24 }}>Optional UPI Details</h3>
                <div className="grid-2">
                    <div>
                        <label>UPI ID</label>
                        <input
                            value={data.upiId}
                            onChange={(e) => onChange('upiId', e.target.value)}
                            placeholder="yourname@bank"
                        />
                    </div>
                    <div>
                        <label>Payee Name</label>
                        <input
                            value={data.payeeName}
                            onChange={(e) => onChange('payeeName', e.target.value)}
                            placeholder="Genzdial"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                    {msg && <span className="muted" style={{ marginLeft: 12, fontSize: 13 }}>{msg}</span>}
                </div>
            </form>
        </div>
    );
}

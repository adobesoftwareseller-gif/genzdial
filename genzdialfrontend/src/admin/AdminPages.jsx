import { useEffect, useState } from 'react';
import api from '../api.js';
import Loader from './Loader.jsx';

const PAGES = [
    { slug: 'privacy-policy', label: 'Privacy Policy' },
    { slug: 'terms-and-conditions', label: 'Terms & Conditions' },
];

export default function AdminPages() {
    const [activeSlug, setActiveSlug] = useState(PAGES[0].slug);
    const [form, setForm] = useState({ title: '', content: '' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState(null);

    const load = (slug) => {
        setLoading(true);
        setSavedAt(null);
        api.get(`/pages/${slug}`)
            .then((r) => setForm({ title: r.data.title || '', content: r.data.content || '' }))
            .catch(() => {
                const fallback = PAGES.find((p) => p.slug === slug);
                setForm({ title: fallback?.label || '', content: '' });
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(activeSlug); }, [activeSlug]);

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put(`/pages/${activeSlug}`, form);
            setSavedAt(new Date());
        } catch (err) {
            alert(err.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div className="admin-page-head">
                <h1 className="admin-title">Static Pages</h1>
            </div>

            <div className="page-tabs">
                {PAGES.map((p) => (
                    <button
                        key={p.slug}
                        type="button"
                        className={`page-tab${activeSlug === p.slug ? ' active' : ''}`}
                        onClick={() => setActiveSlug(p.slug)}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <Loader label="Loading page…" />
            ) : (
                <form className="admin-form" onSubmit={save}>
                    <div className="grid-2">
                        <div className="span-2">
                            <label>Page Title</label>
                            <input
                                value={form.title}
                                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="span-2">
                            <label>Content</label>
                            <textarea
                                rows="18"
                                value={form.content}
                                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                                placeholder="Write the page content here. Separate paragraphs with a blank line."
                                required
                            />
                            <small className="muted">
                                Formatting: <code># Heading</code> for sections, <code>- item</code> for bullet lists,
                                <code> 1. item</code> for numbered lists. Separate blocks with a blank line.
                            </small>
                        </div>
                    </div>
                    <div className="form-actions">
                        {savedAt && (
                            <span className="muted" style={{ marginRight: 'auto', fontSize: 13 }}>
                                Saved at {savedAt.toLocaleTimeString()}
                            </span>
                        )}
                        <button className="btn-primary" disabled={saving}>
                            {saving ? 'Saving…' : 'Save'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

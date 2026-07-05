import { useEffect, useState } from 'react';
import api from '../api.js';
import Loader from './Loader.jsx';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ products: 0, banners: 0 });
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/products'),
            api.get('/banners/all'),
        ]).then(([p, b]) => setStats({ products: p.data.length, banners: b.data.length }))
            .catch(() => { })
            .finally(() => setFetching(false));
    }, []);

    return (
        <div>
            <h1 className="admin-title">Dashboard</h1>
            <p className="muted">Welcome back. Here's a quick snapshot of your store.</p>

            {fetching ? (
                <Loader label="Loading stats…" />
            ) : (
                <div className="admin-stats">
                    <div className="stat">
                        <div className="stat-label">Total Products</div>
                        <div className="stat-value">{stats.products}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-label">Active Banners</div>
                        <div className="stat-value">{stats.banners}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-label">Status</div>
                        <div className="stat-value" style={{ color: '#10b981' }}>Online</div>
                    </div>
                </div>
            )}
        </div>
    );
}

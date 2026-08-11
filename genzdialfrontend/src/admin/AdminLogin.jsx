import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AuthContext.jsx';

export default function AdminLogin() {
    const { login, isAuthed } = useAdminAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (isAuthed) {
        navigate('/admin', { replace: true });
        return null;
    }

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/admin');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login">
            <form onSubmit={submit} className="admin-login-card">
                <div className="admin-brand" style={{ marginBottom: 8 }}>⌚ GenZdial</div>
                <h2>Admin Sign In</h2>
                <p className="muted">Manage products, banners and more.</p>

                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

                <label>Password</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

                {error && <p className="error-msg">{error}</p>}

                <button className="btn-primary" disabled={loading} style={{ marginTop: 12, width: '100%' }}>
                    {loading ? 'Signing in…' : 'Sign In →'}
                </button>

                <small className="muted" style={{ display: 'block', marginTop: 14 }}>
                    Default: admin@genzdial.com / admin123
                </small>
            </form>
        </div>
    );
}

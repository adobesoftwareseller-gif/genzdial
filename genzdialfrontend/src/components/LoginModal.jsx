import { useEffect, useRef, useState } from 'react';
import { useUserAuth } from '../context/UserAuthContext.jsx';
import logo from '../images/logo.png';

export default function LoginModal() {
    const { loginOpen, closeLogin, openSignup, sendOtp, verifyOtp } = useUserAuth();
    const [step, setStep] = useState('phone'); // 'phone' | 'otp'
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (loginOpen) {
            setStep('phone');
            setPhone('');
            setOtp('');
            setError('');
            setInfo('');
            setTimeout(() => inputRef.current?.focus(), 50);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [loginOpen]);

    if (!loginOpen) return null;

    const submitPhone = async (e) => {
        e.preventDefault();
        const phoneDigits = phone.replace(/\D/g, '');
        if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
            setError('Enter a valid 10-digit mobile number');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const r = await sendOtp(phoneDigits, 'login');
            setInfo(r.devOtp ? `OTP sent. (Dev OTP: ${r.devOtp})` : 'OTP sent to your mobile number.');
            setStep('otp');
            setTimeout(() => inputRef.current?.focus(), 50);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const submitOtp = async (e) => {
        e.preventDefault();
        if (otp.length < 4) { setError('Enter the OTP'); return; }
        setLoading(true);
        setError('');
        try {
            await verifyOtp(phone.replace(/\D/g, ''), otp, { mode: 'login' });
            closeLogin();
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-overlay" onClick={closeLogin}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
                <button type="button" className="login-close" onClick={closeLogin} aria-label="Close">×</button>

                <img src={logo} alt="Genzdial" className="login-logo" />
                <h3 className="login-title">Login</h3>
                <p className="login-sub">
                    Enter your registered mobile number to receive an OTP.
                </p>

                {step === 'phone' && (
                    <form onSubmit={submitPhone} className="login-form">
                        <div className="login-phone">
                            <span className="login-cc">🇮🇳 +91</span>
                            <input
                                ref={inputRef}
                                type="tel"
                                inputMode="numeric"
                                placeholder="Mobile Number*"
                                value={phone}
                                maxLength={10}
                                autoComplete="tel"
                                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                            />
                        </div>
                        {error && <div className="login-error">{error}</div>}
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Sending…' : 'GET OTP'}
                        </button>
                        <p className="login-switch">
                            New to Genzdial?{' '}
                            <button type="button" className="login-link-inline" onClick={openSignup}>
                                Create an account
                            </button>
                        </p>
                    </form>
                )}

                {step === 'otp' && (
                    <form onSubmit={submitOtp} className="login-form">
                        {info && <div className="login-info">{info}</div>}
                        <input
                            ref={inputRef}
                            type="text"
                            inputMode="numeric"
                            placeholder="Enter OTP"
                            value={otp}
                            maxLength={6}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className="login-otp"
                        />
                        {error && <div className="login-error">{error}</div>}
                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? 'Verifying…' : 'VERIFY & LOGIN'}
                        </button>
                        <button
                            type="button"
                            className="login-link"
                            onClick={() => { setStep('phone'); setError(''); setInfo(''); }}
                        >
                            Change mobile number
                        </button>
                    </form>
                )}

                <p className="login-legal">
                    By continuing, you agree to our Terms and Privacy Policy.
                </p>
            </div>
        </div>
    );
}

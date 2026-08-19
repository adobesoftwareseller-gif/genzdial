import { useEffect, useRef, useState } from 'react';
import { useUserAuth } from '../context/UserAuthContext.jsx';

export default function CheckoutOtpLogin({ phone: initialPhone, name, onVerified, onBack }) {
    const { sendOtp, verifyOtp } = useUserAuth();

    const [phone, setPhone] = useState(initialPhone || '');
    const [subStep, setSubStep] = useState('phone'); // 'phone' | 'otp'
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const [authMode, setAuthMode] = useState('login'); // decided by backend response
    const timerRef = useRef(null);

    useEffect(() => {
        if (resendTimer <= 0) return;
        timerRef.current = setTimeout(() => setResendTimer((t) => t - 1), 1000);
        return () => clearTimeout(timerRef.current);
    }, [resendTimer]);

    const handleSendOtp = async (e) => {
        e?.preventDefault();
        setError('');
        if (phone.replace(/\D/g, '').length !== 10) {
            setError('Enter a valid 10-digit mobile number');
            return;
        }
        setLoading(true);
        let mode = 'login';
        try {
            await sendOtp(phone, 'login');
        } catch (err) {
            if (err.response?.status === 404) {
                // No account yet for this number — fall back to signup automatically.
                mode = 'signup';
                try {
                    await sendOtp(phone, 'signup');
                } catch (err2) {
                    setError(err2.response?.data?.message || 'Failed to send OTP. Try again.');
                    setLoading(false);
                    return;
                }
            } else {
                setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
                setLoading(false);
                return;
            }
        }
        setAuthMode(mode);
        setSubStep('otp');
        setResendTimer(30);
        setLoading(false);
    };

    const handleVerifyOtp = async (e) => {
        e?.preventDefault();
        setError('');
        if (otp.replace(/\D/g, '').length < 4) {
            setError('Enter the OTP you received');
            return;
        }
        setLoading(true);
        try {
            await verifyOtp(phone, otp, {
                mode: authMode,
                name: authMode === 'signup' ? name : undefined,
            });
            onVerified?.();
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setError('');
        setLoading(true);
        try {
            await sendOtp(phone, authMode);
            setResendTimer(30);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="otp-login-step" style={{ background: '#f8f9fa', padding: '24px', borderRadius: '8px', maxWidth: '420px' }}>
            <h3 style={{ marginTop: 0 }}>Verify your mobile number</h3>
            <p style={{ color: '#565959', fontSize: '13px', marginBottom: '20px' }}>
                Please login with OTP to continue to payment.
            </p>

            {subStep === 'phone' && (
                <form onSubmit={handleSendOtp}>
                    <input
                        placeholder="Mobile Number*"
                        inputMode="numeric"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #888c8c', marginBottom: '12px', boxSizing: 'border-box' }}
                    />
                    {error && <div className="login-error">{error}</div>}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
                        <button type="button" onClick={onBack} style={{ background: 'transparent', border: '1px solid #d5d9d9', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                            Back
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1 }}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </div>
                </form>
            )}

            {subStep === 'otp' && (
                <form onSubmit={handleVerifyOtp}>
                    <p style={{ fontSize: '13px', marginBottom: '10px' }}>
                        OTP sent to <strong>{phone}</strong>{' '}
                        <span
                            style={{ color: '#007185', cursor: 'pointer' }}
                            onClick={() => { setSubStep('phone'); setOtp(''); setError(''); }}
                        >
                            Change
                        </span>
                    </p>
                    <input
                        placeholder="Enter OTP*"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #888c8c', marginBottom: '12px', letterSpacing: '4px', fontSize: '18px', boxSizing: 'border-box' }}
                        autoFocus
                    />
                    {error && <div className="login-error">{error}</div>}
                    <div style={{ marginTop: '10px' }}>
                        <span
                            onClick={handleResend}
                            style={{ fontSize: '13px', color: resendTimer > 0 ? '#999' : '#007185', cursor: resendTimer > 0 ? 'default' : 'pointer' }}
                        >
                            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
                        <button type="button" onClick={onBack} style={{ background: 'transparent', border: '1px solid #d5d9d9', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                            Back
                        </button>
                        <button type="submit" disabled={loading} className="btn-primary" style={{ flex: 1 }}>
                            {loading ? 'Verifying...' : 'Verify & Continue'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

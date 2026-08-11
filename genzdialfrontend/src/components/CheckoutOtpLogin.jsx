import { useEffect, useRef, useState } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../firebase.js';
import { useUserAuth } from '../context/UserAuthContext.jsx';

export default function CheckoutOtpLogin({ phone: initialPhone, name, onVerified, onBack }) {
    const { loginWithFirebase } = useUserAuth();

    const [phone, setPhone] = useState(initialPhone || '');
    const [subStep, setSubStep] = useState('phone'); // 'phone' | 'otp'
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);
    const timerRef = useRef(null);
    const confirmationRef = useRef(null);
    const recaptchaRef = useRef(null);
    const recaptchaContainerId = useRef(`recaptcha-container-${Math.random().toString(36).slice(2)}`);

    useEffect(() => {
        // Clean up the invisible reCAPTCHA widget when this step unmounts.
        return () => {
            recaptchaRef.current?.clear?.();
            recaptchaRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (resendTimer <= 0) return;
        timerRef.current = setTimeout(() => setResendTimer((t) => t - 1), 1000);
        return () => clearTimeout(timerRef.current);
    }, [resendTimer]);

    const getVerifier = () => {
        if (!recaptchaRef.current) {
            recaptchaRef.current = new RecaptchaVerifier(auth, recaptchaContainerId.current, {
                size: 'invisible',
            });
        }
        return recaptchaRef.current;
    };

    const handleSendOtp = async (e) => {
        e?.preventDefault();
        setError('');
        if (phone.replace(/\D/g, '').length !== 10) {
            setError('Enter a valid 10-digit mobile number');
            return;
        }
        setLoading(true);
        try {
            const verifier = getVerifier();
            const confirmation = await signInWithPhoneNumber(auth, `+91${phone}`, verifier);
            confirmationRef.current = confirmation;
            setSubStep('otp');
            setResendTimer(30);
        } catch (err) {
            // TEMP DEBUG LOG — remove once the real Firebase error is identified
            console.error('OTP SEND ERROR:', err.code, err.message, err);
            setError(err.message?.includes('too-many-requests')
                ? 'Too many attempts, please try again later'
                : 'Failed to send OTP. Try again.');
            // Reset the widget so a retry gets a fresh challenge.
            recaptchaRef.current?.clear?.();
            recaptchaRef.current = null;
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e?.preventDefault();
        setError('');
        if (otp.replace(/\D/g, '').length < 4) {
            setError('Enter the OTP you received');
            return;
        }
        if (!confirmationRef.current) {
            setError('Session expired, please request OTP again');
            setSubStep('phone');
            return;
        }
        setLoading(true);
        try {
            const result = await confirmationRef.current.confirm(otp);
            const idToken = await result.user.getIdToken();
            await loginWithFirebase(idToken, { name });
            onVerified?.();
        } catch (err) {
            // TEMP DEBUG LOG — remove once everything works
            console.error('OTP VERIFY ERROR:', err.code, err.message, err);
            setError(err.message?.includes('invalid-verification-code')
                ? 'Invalid OTP, please check and try again'
                : 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendTimer > 0) return;
        setError('');
        setLoading(true);
        try {
            const verifier = getVerifier();
            const confirmation = await signInWithPhoneNumber(auth, `+91${phone}`, verifier);
            confirmationRef.current = confirmation;
            setResendTimer(30);
        } catch (err) {
            // TEMP DEBUG LOG — remove once the real Firebase error is identified
            console.error('OTP RESEND ERROR:', err.code, err.message, err);
            setError('Failed to resend OTP');
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

            {/* Invisible reCAPTCHA anchor required by Firebase Phone Auth */}
            <div id={recaptchaContainerId.current} />

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

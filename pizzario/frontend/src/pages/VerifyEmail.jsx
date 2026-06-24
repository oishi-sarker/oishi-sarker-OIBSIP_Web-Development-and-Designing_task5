import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [token, setToken] = useState(params.get('token') || '');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const t = params.get('token');
    if (t) setToken(t);
  }, [params]);

  const submit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Please paste the verification token');
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyEmail(token);
      toast.success('Email verified successfully!');
      setVerified(true);
      await refreshUser();
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-char-800 py-12">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="text-6xl mb-3">{verified ? '✅' : '📧'}</div>
        <h1 className="text-2xl text-char-50 mb-2">{verified ? 'Email Verified!' : 'Verify Your Email'}</h1>
        <p className="text-char-300 text-sm mb-6">
          {verified
            ? 'Redirecting you to your dashboard…'
            : 'We sent a verification link to your email. Click the link or paste the token below.'}
        </p>

        {!verified && (
          <form onSubmit={submit} className="space-y-3 text-left">
            <div>
              <label className="label" htmlFor="token">Verification Token</label>
              <input
                id="token"
                type="text"
                className="input font-mono text-sm"
                placeholder="Paste token from email link…"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Verifying…' : 'Verify Email'}
            </button>
          </form>
        )}

        <div className="mt-6 text-xs text-char-400">
          <p>💡 Tip: Check the backend console for an "Email preview URL" when running without real SMTP.</p>
          <p className="mt-2">
            <Link to="/dashboard" className="text-ember-400 hover:underline">Skip for now</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

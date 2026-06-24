import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authApi } from '../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('If the email exists, a reset link has been sent.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-char-800 py-12">
      <div className="card w-full max-w-md p-8 text-center">
        <div className="text-6xl mb-3">{sent ? '✉️' : '🔑'}</div>
        <h1 className="text-2xl text-char-50 mb-2">{sent ? 'Check Your Email' : 'Forgot Password'}</h1>
        <p className="text-char-300 text-sm mb-6">
          {sent
            ? `We've sent a password reset link to ${email}. The link expires in 1 hour.`
            : 'Enter your email and we will send you a password reset link.'}
        </p>

        {!sent && (
          <form onSubmit={submit} className="space-y-3 text-left">
            <div>
              <label className="label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-char-300 mt-6">
          <Link to="/login" className="text-ember-400 font-semibold hover:underline">← Back to login</Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const update = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password);
      toast.success('Account created! Check your email to verify.');
      if (!user.isEmailVerified) {
        navigate('/verify-email');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-char-800 py-12">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🍕</div>
          <h1 className="text-3xl text-char-50">Create Account</h1>
          <p className="text-char-300 text-sm mt-1">Join Pizzario and start building your dream pizza</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="name">Full Name</label>
            <input id="name" name="name" type="text" required className="input" placeholder="John Doe" value={form.name} onChange={update} />
          </div>
          <div>
            <label className="label" htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" required className="input" placeholder="you@example.com" value={form.email} onChange={update} />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required className="input" placeholder="Min 6 characters" value={form.password} onChange={update} />
          </div>
          <div>
            <label className="label" htmlFor="confirm">Confirm Password</label>
            <input id="confirm" name="confirm" type="password" required className="input" placeholder="Re-enter password" value={form.confirm} onChange={update} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-char-300 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-ember-400 font-semibold hover:underline">Sign in</Link>
        </p>

        <p className="text-xs text-char-400 mt-4 text-center">
          By signing up, you agree to receive a verification email. We use a test email service by default.
        </p>
      </div>
    </div>
  );
}

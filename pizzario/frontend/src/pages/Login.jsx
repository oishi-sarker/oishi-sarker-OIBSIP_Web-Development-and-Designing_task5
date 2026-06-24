import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      const from = location.state?.from;
      if (from) navigate(from);
      else navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-char-800 py-12">
      <div className="card w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🍕</div>
          <h1 className="text-3xl text-char-50">Welcome Back</h1>
          <p className="text-char-300 text-sm mt-1">Sign in to your Pizzario account</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
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
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-char-300">
              <input type="checkbox" className="rounded border-char-600" /> Remember me
            </label>
            <Link to="/forgot-password" className="text-ember-400 hover:underline">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-char-300 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-ember-400 font-semibold hover:underline">Create one</Link>
        </p>

        <div className="mt-6 p-3 bg-char-900 rounded-lg text-xs text-char-300">
          <p className="font-semibold mb-1">Demo credentials (after running seed):</p>
          <p>👤 User: <code>user@pizza.com</code> / <code>User@123</code></p>
          <p>👨‍💼 Admin: <code>admin@pizza.com</code> / <code>Admin@123</code></p>
        </div>
      </div>
    </div>
  );
}

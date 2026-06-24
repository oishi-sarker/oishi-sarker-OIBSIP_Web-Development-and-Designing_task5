import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalQuantity } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 bg-char-900/90 backdrop-blur-md border-b border-char-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-2 group">
            <span className="text-3xl group-hover:animate-spin-slow">🍕</span>
            <span className="font-display text-2xl text-ember-400 tracking-wider">PIZZ<span className="text-char-100">ARIO</span></span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {!user && (
              <>
                <Link to="/" className="btn-ghost">Home</Link>
                <Link to="/login" className="btn-ghost">Login</Link>
                <Link to="/register" className="btn-primary">Get Started</Link>
              </>
            )}
            {user && !isAdmin && !isAdminPage && (
              <>
                <Link to="/dashboard" className="btn-ghost">Menu</Link>
                <Link to="/custom-pizza" className="btn-ghost">Build Your Pizza</Link>
                <Link to="/orders" className="btn-ghost">My Orders</Link>
                <Link to="/cart" className="relative btn-ghost">
                  🛒 Cart
                  {totalQuantity > 0 && (
                    <span className="absolute -top-1 -right-1 bg-ember-500 text-char-950 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {totalQuantity}
                    </span>
                  )}
                </Link>
                <div className="ml-2 flex items-center gap-3 pl-3 border-l border-char-700">
                  <span className="text-sm text-char-300">Hi, {user.name.split(' ')[0]}</span>
                  <button onClick={handleLogout} className="btn-secondary !py-1.5 !px-3 text-sm">Logout</button>
                </div>
              </>
            )}
            {user && isAdmin && (
              <>
                <Link to="/admin" className="btn-ghost">Dashboard</Link>
                <Link to="/admin/inventory" className="btn-ghost">Inventory</Link>
                <Link to="/admin/orders" className="btn-ghost">Orders</Link>
                <div className="ml-2 flex items-center gap-3 pl-3 border-l border-char-700">
                  <span className="text-sm text-char-300">{user.name}</span>
                  <button onClick={handleLogout} className="btn-secondary !py-1.5 !px-3 text-sm">Logout</button>
                </div>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-char-800"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t border-char-700 bg-char-900">
          <div className="px-4 py-3 space-y-2">
            {!user && (
              <>
                <Link to="/" className="block btn-ghost w-full !justify-start" onClick={() => setOpen(false)}>Home</Link>
                <Link to="/login" className="block btn-ghost w-full !justify-start" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" className="block btn-primary w-full" onClick={() => setOpen(false)}>Get Started</Link>
              </>
            )}
            {user && !isAdmin && (
              <>
                <Link to="/dashboard" className="block btn-ghost w-full !justify-start" onClick={() => setOpen(false)}>Menu</Link>
                <Link to="/custom-pizza" className="block btn-ghost w-full !justify-start" onClick={() => setOpen(false)}>Build Your Pizza</Link>
                <Link to="/orders" className="block btn-ghost w-full !justify-start" onClick={() => setOpen(false)}>My Orders</Link>
                <Link to="/cart" className="block btn-ghost w-full !justify-start" onClick={() => setOpen(false)}>
                  Cart {totalQuantity > 0 && `(${totalQuantity})`}
                </Link>
                <button onClick={() => { setOpen(false); handleLogout(); }} className="block btn-secondary w-full">Logout</button>
              </>
            )}
            {user && isAdmin && (
              <>
                <Link to="/admin" className="block btn-ghost w-full !justify-start" onClick={() => setOpen(false)}>Dashboard</Link>
                <Link to="/admin/inventory" className="block btn-ghost w-full !justify-start" onClick={() => setOpen(false)}>Inventory</Link>
                <Link to="/admin/orders" className="block btn-ghost w-full !justify-start" onClick={() => setOpen(false)}>Orders</Link>
                <button onClick={() => { setOpen(false); handleLogout(); }} className="block btn-secondary w-full">Logout</button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

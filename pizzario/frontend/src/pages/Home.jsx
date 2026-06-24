import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Home() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-char-900 via-char-900 to-ember-900 text-char-50">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="inline-block bg-ember-500/15 border border-ember-500/30 text-ember-300 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                🔥 Hot &amp; Fresh • Delivered in 30 mins
              </p>
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-none mb-6">
                BUILD YOUR<br/><span className="text-ember-400">DREAM PIZZA</span>
              </h1>
              <p className="text-lg text-char-300 mb-8 max-w-md">
                Pick your base, sauce, cheese, veggies, and meat. Custom-built, freshly baked, and tracked in real time
                from our oven to your doorstep.
              </p>
              <div className="flex flex-wrap gap-3">
                {user ? (
                  <Link to={isAdmin ? '/admin' : '/dashboard'} className="btn-primary shadow-ember">
                    {isAdmin ? 'Go to Admin Dashboard' : 'Browse Menu'} →
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn-primary shadow-ember">
                      Get Started — It's Free
                    </Link>
                    <Link to="/login" className="btn bg-char-800 text-char-50 border border-char-600 hover:bg-char-700">
                      Login
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm">
                <div>
                  <div className="text-3xl font-bold text-char-50">5+5+5</div>
                  <div className="text-char-400">Bases, Sauces, Cheeses</div>
                </div>
                <div className="border-l border-char-600 pl-6">
                  <div className="text-3xl font-bold text-char-50">13+</div>
                  <div className="text-char-400">Veggie &amp; Meat Toppings</div>
                </div>
                <div className="border-l border-char-600 pl-6">
                  <div className="text-3xl font-bold text-char-50">30 min</div>
                  <div className="text-char-400">Avg Delivery Time</div>
                </div>
              </div>
            </div>

            {/* Pizza emoji hero with ember glow — signature element */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-ember-500/30 blur-3xl animate-ember-flicker"></div>
                <div className="relative text-[20rem] drop-shadow-2xl">🍕</div>
                <div className="absolute top-12 right-4 text-6xl animate-bounce">🔥</div>
                <div className="absolute bottom-12 left-0 text-5xl animate-bounce" style={{ animationDelay: '0.5s' }}>🍅</div>
                <div className="absolute top-32 left-8 text-5xl animate-bounce" style={{ animationDelay: '1s' }}>🧀</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl text-char-50">Why Pizzario?</h2>
          <p className="text-char-300 mt-3 max-w-2xl mx-auto">
            A complete pizza delivery experience built on a modern stack — secure auth, real-time tracking,
            and granular inventory control.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '🛠️', title: 'Build Your Own', desc: '5 bases, 5 sauces, 5 cheeses, 8+ veggies, 5 meats — endless combinations.' },
            { icon: '🔐', title: 'Secure Auth', desc: 'JWT-based login with email verification and password reset flow.' },
            { icon: '💳', title: 'Razorpay Payments', desc: 'Seamless checkout powered by Razorpay test mode integration.' },
            { icon: '📊', title: 'Admin Inventory', desc: 'Track stock per ingredient with automatic low-stock alerts.' },
            { icon: '📍', title: 'Real-time Tracking', desc: 'Watch your order move from kitchen to delivery — live via Socket.io.' },
            { icon: '🔔', title: 'Smart Alerts', desc: 'Admins get email alerts whenever stock dips below threshold.' },
          ].map((f) => (
            <div key={f.title} className="card p-6 hover:border-ember-700 hover:shadow-md transition-all">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="text-xl text-char-50 mb-2">{f.title}</h3>
              <p className="text-char-300 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-char-900 py-16 border-y border-char-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl text-center text-char-50 mb-12">From Cravings to Doorstep</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: 1, title: 'Sign Up', desc: 'Quick registration with email verification.' },
              { step: 2, title: 'Build or Pick', desc: 'Order from menu or customize your dream pizza.' },
              { step: 3, title: 'Pay Securely', desc: 'Razorpay checkout, instant confirmation.' },
              { step: 4, title: 'Track Live', desc: 'Watch status updates in real-time.' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-ember-500 text-char-950 flex items-center justify-center text-2xl font-bold mb-4 shadow-lg shadow-ember-500/40">
                  {s.step}
                </div>
                <h3 className="text-lg text-char-50 mb-2">{s.title}</h3>
                <p className="text-sm text-char-300">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-3xl sm:text-4xl text-char-50 mb-4">Ready to bite in?</h2>
        <p className="text-char-300 mb-8 max-w-xl mx-auto">
          Create your free account and start building. Your first pizza is just a few clicks away.
        </p>
        <Link to={user ? (isAdmin ? '/admin' : '/dashboard') : '/register'} className="btn-primary text-lg !px-8 !py-3 shadow-ember">
          {user ? 'Continue' : 'Get Started Now'} →
        </Link>
      </section>
    </div>
  );
}

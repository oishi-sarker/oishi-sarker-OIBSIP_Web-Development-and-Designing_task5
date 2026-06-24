export default function Footer() {
  return (
    <footer className="bg-char-950 text-char-300 border-t border-char-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">🍕</span>
              <span className="font-display text-2xl tracking-wider text-char-50">PIZZ<span className="text-ember-400">ARIO</span></span>
            </div>
            <p className="text-sm text-char-400 max-w-md">
              Hot, fresh, and made just the way you like it. Build your dream pizza from our 5-base / 5-sauce / 5-cheese selection
              and track it in real time from oven to your doorstep.
            </p>
          </div>
          <div>
            <h4 className="text-char-50 font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/dashboard" className="hover:text-ember-400 transition">Menu</a></li>
              <li><a href="/custom-pizza" className="hover:text-ember-400 transition">Build Your Pizza</a></li>
              <li><a href="/orders" className="hover:text-ember-400 transition">My Orders</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-char-50 font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>📞 +91 99999 99999</li>
              <li>✉️ hello@pizzario.app</li>
              <li>📍 123 Pizza Street, Mumbai</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-char-800 mt-8 pt-6 text-center text-sm text-char-400">
          © {new Date().getFullYear()} Pizzario. Crafted with 🍕 for pizza lovers.
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';
import { Wallet, Github, Twitter, Linkedin } from 'lucide-react';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'How it works', href: '#how-it-works' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
  ],
};

const Footer = () => {
  return (
    <footer className="relative border-t border-white/[0.06] px-6 py-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
                <Wallet className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-display text-lg font-bold text-ink-100">ExpenseFlow AI</span>
            </div>
            <p className="text-sm text-ink-500 max-w-xs">
              Smart expense splitting made beautiful. Built for groups who'd rather split the bill than the friendship.
            </p>
            <div className="flex gap-3 mt-5">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-ink-400 transition-colors hover:bg-white/[0.08] hover:text-ink-100"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-sm font-semibold text-ink-100 mb-4">{section}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-ink-500 transition-colors hover:text-ink-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-ink-600">© {new Date().getFullYear()} ExpenseFlow AI. All rights reserved.</p>
          <Link to="/register" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
            Get started — it's free →
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

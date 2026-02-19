'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProtectedAdminRoute from '@/components/auth/ProtectedAdminRoute';

const navItems = [
  { href: '/dashboard/admin', label: 'Dashboard' },
  { href: '/dashboard/admin/products', label: 'Products' },
  { href: '/dashboard/admin/users', label: 'Users' },
  { href: '/dashboard/admin/orders', label: 'Orders' },
  { href: '/dashboard/admin/invoices', label: 'Invoices' },
  { href: '/dashboard/admin/consultations', label: 'Consultations' },
  { href: '/dashboard/admin/appointments', label: 'Appointments' },
  { href: '/dashboard/admin/reviews', label: 'Reviews' },
  { href: '/dashboard/admin/subscriptions', label: 'Subscriptions' },
  { href: '/dashboard/admin/quests', label: 'Quests' },
  { href: '/dashboard/admin/financial', label: 'Financial' },
  { href: '/dashboard/admin/analytics', label: 'Analytics' },
  { href: '/dashboard/admin/sentiment', label: 'Sentiment' },
  { href: '/dashboard/admin/distribution', label: 'Distribution' },
];

export default function AdminLayout({ children }) {
  return (
    <ProtectedAdminRoute>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-200px)]">
        <aside className="lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-luxury-gold/20 py-6 px-4">
          <nav className="flex flex-wrap lg:flex-col gap-2">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedAdminRoute>
  );
}

function NavLink({ href, children }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/dashboard/admin' && pathname?.startsWith(href));
  return (
    <Link
      href={href}
      className={`block px-4 py-2 rounded text-sm transition-colors ${
        isActive ? 'bg-luxury-gold/20 text-luxury-gold' : 'text-luxury-ivory/80 hover:text-luxury-gold hover:bg-luxury-gold/5'
      }`}
    >
      {children}
    </Link>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ProtectedEmployeeRoute from '@/components/auth/ProtectedEmployeeRoute';

const navItems = [
  { href: '/dashboard/employee', label: 'Dashboard' },
  { href: '/dashboard/employee/consultations', label: 'Consultations' },
  { href: '/dashboard/employee/appointments', label: 'My Schedule' },
  { href: '/dashboard/employee/invoices', label: 'Invoices' },
  { href: '/dashboard/employee/messages', label: 'Messages' },
  { href: '/dashboard/employee/products', label: 'My Products' },
  { href: '/dashboard/employee/notifications', label: 'Notifications' },
  { href: '/dashboard/employee/report', label: 'Report' },
  { href: '/dashboard/employee/profile', label: 'Profile' },
];

export default function EmployeeLayout({ children }) {
  return (
    <ProtectedEmployeeRoute>
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-200px)]">
        <aside className="lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-luxury-gold/20 py-6 px-4">
          <nav className="flex flex-wrap lg:flex-col gap-2">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
            <div className="lg:mt-4 pt-4 lg:pt-4 border-t border-luxury-gold/20">
              <NavLink href="/shop">Shop</NavLink>
              <NavLink href="/diagnostic">Diagnostic</NavLink>
              <NavLink href="/beauty-scanner">AI Scanner</NavLink>
            </div>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </ProtectedEmployeeRoute>
  );
}

function NavLink({ href, children }) {
  const pathname = usePathname();
  const isActive = pathname === href;
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

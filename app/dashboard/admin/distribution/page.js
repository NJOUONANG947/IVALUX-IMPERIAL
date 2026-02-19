'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminDistributors, getAdminProductHandlings, getProducts } from '@/lib/api';
import { useAuth, isAdmin } from '@/lib/AuthContext';

const COUNTRIES = [
  { code: 'CA', name: 'Canada' },
  { code: 'US', name: 'United States' },
  { code: 'FR', name: 'France' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
];

export default function DistributionTrackingPage() {
  const { currentUser } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [products, setProducts] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [handlings, setHandlings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAdmin(currentUser)) return;
    Promise.all([
      getProducts(),
      getAdminDistributors(selectedCountry || undefined),
      getAdminProductHandlings(),
    ])
      .then(([p, d, h]) => {
        setProducts(p);
        setDistributors(d);
        setHandlings(h);
        setError(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [currentUser, selectedCountry]);

  if (!isAdmin(currentUser)) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center px-6">
        <h1 className="text-2xl font-serif text-luxury-ivory mb-4">Access restricted</h1>
        <p className="text-luxury-ivory/60 mb-6">Distribution tracking is admin-only.</p>
        <Link href="/dashboard" className="text-luxury-gold hover:underline">Back to Dashboard</Link>
      </div>
    );
  }

  const getEmployeeName = (h) => h.profiles?.full_name || h.employee_id || '—';
  const getProductName = (h) => h.products?.name || h.product_id || '—';

  const employeesByProduct = handlings.reduce((acc, h) => {
    const key = `${h.product_id}-${h.country}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(getEmployeeName(h));
    return acc;
  }, {});

  return (
    <div className="min-h-[calc(100vh-200px)] px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-serif text-luxury-ivory mb-2">Distribution Tracking</h1>
            <p className="text-luxury-ivory/60">Multi-country product distribution overview</p>
          </div>
          <Link href="/dashboard/admin" className="text-luxury-gold hover:underline text-sm">
            ← Admin Dashboard
          </Link>
        </div>

        {error && (
          <p className="text-amber-400 mb-6 bg-amber-500/10 border border-amber-500/30 px-4 py-3">{error}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedCountry(null)}
            className={`px-4 py-2 rounded border text-sm transition-colors ${
              !selectedCountry ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold' : 'border-luxury-gold/30 text-luxury-ivory/80 hover:border-luxury-gold'
            }`}
          >
            All Countries
          </button>
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              onClick={() => setSelectedCountry(c.code)}
              className={`px-4 py-2 rounded border text-sm transition-colors ${
                selectedCountry === c.code ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold' : 'border-luxury-gold/30 text-luxury-ivory/80 hover:border-luxury-gold'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-luxury-ivory/60">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2 bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg">
              <h2 className="text-xl font-serif text-luxury-gold mb-4">Products by Country</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-luxury-gold/20 text-left">
                      <th className="py-3 pr-4 text-luxury-gold/80 font-medium">Product</th>
                      <th className="py-3 pr-4 text-luxury-gold/80 font-medium">Countries</th>
                      <th className="py-3 text-luxury-gold/80 font-medium">Employees Handling</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter((p) => !selectedCountry || (p.countries_available || []).includes(selectedCountry))
                      .map((product) => (
                        <tr key={product.id} className="border-b border-luxury-gold/10">
                          <td className="py-3 pr-4 text-luxury-ivory">{product.name}</td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-wrap gap-1">
                              {(product.countries_available || []).map((code) => {
                                const c = COUNTRIES.find((x) => x.code === code);
                                return (
                                  <span
                                    key={code}
                                    className="px-2 py-0.5 bg-luxury-gold/10 text-luxury-gold rounded text-xs"
                                  >
                                    {c?.name || code}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3 text-luxury-ivory/80 text-xs">
                            {(product.countries_available || [])
                              .filter((c) => !selectedCountry || c === selectedCountry)
                              .map((country) => {
                                const empList = employeesByProduct[`${product.id}-${country}`] || [];
                                return empList.length ? `${country}: ${empList.join(', ')}` : null;
                              })
                              .filter(Boolean)
                              .join(' · ') || '—'}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg">
              <h2 className="text-xl font-serif text-luxury-gold mb-4">Distributors</h2>
              <div className="space-y-3">
                {distributors.length === 0 ? (
                  <p className="text-luxury-ivory/60 text-sm">No distributors yet.</p>
                ) : (
                  distributors.map((d) => (
                    <div
                      key={d.id}
                      className="p-3 bg-luxury-black/50 rounded border border-luxury-gold/10"
                    >
                      <p className="font-medium text-luxury-ivory">{d.name}</p>
                      <p className="text-luxury-gold/80 text-xs mt-1">
                        {COUNTRIES.find((c) => c.code === d.country)?.name || d.country} · {d.id?.slice(0, 8)}
                      </p>
                      {d.contact_info && (
                        <p className="text-luxury-ivory/50 text-xs mt-1">{d.contact_info}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="lg:col-span-3 bg-charcoal/50 border border-luxury-gold/20 p-6 rounded-lg">
              <h2 className="text-xl font-serif text-luxury-gold mb-4">Employee Product Handling</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-luxury-gold/20 text-left">
                      <th className="py-3 pr-4 text-luxury-gold/80 font-medium">Employee</th>
                      <th className="py-3 pr-4 text-luxury-gold/80 font-medium">Product</th>
                      <th className="py-3 text-luxury-gold/80 font-medium">Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    {handlings
                      .filter((h) => !selectedCountry || h.country === selectedCountry)
                      .map((h) => (
                        <tr key={h.id} className="border-b border-luxury-gold/10">
                          <td className="py-3 pr-4 text-luxury-ivory">{getEmployeeName(h)}</td>
                          <td className="py-3 pr-4 text-luxury-ivory">{getProductName(h)}</td>
                          <td className="py-3 text-luxury-ivory/80">{h.country}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {handlings.length === 0 && (
                  <p className="text-luxury-ivory/60 text-sm py-4">No assignments yet.</p>
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

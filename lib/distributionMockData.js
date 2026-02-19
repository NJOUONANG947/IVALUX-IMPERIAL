/**
 * Multi-Country Product Distribution Mock Data
 * =============================================
 * Frontend-only. No backend. Use for distribution tracking UI.
 *
 * Structure prepared for future backend:
 * - products_distribution: products with countries_available and distributor per country
 * - distributors: per-country distributor info
 * - distribution_employees: employees handling products/regions
 */

// Products with country availability and distributor per country
// Each product has: id, name, countries_available, country_distributors { [countryCode]: distributorId }
export const productsDistribution = [
  {
    id: 1,
    name: 'Booster Puissance Blancheur',
    countries_available: ['CA', 'US', 'FR'],
    country_distributors: { CA: 'DIST-001', US: 'DIST-002', FR: 'DIST-003' },
  },
  {
    id: 5,
    name: 'Crème Visage Blanche Injection',
    countries_available: ['CA', 'US', 'FR', 'BE'],
    country_distributors: { CA: 'DIST-001', US: 'DIST-002', FR: 'DIST-003', BE: 'DIST-003' },
  },
  {
    id: 7,
    name: 'Gamme Blanche Injection',
    countries_available: ['CA', 'US', 'FR'],
    country_distributors: { CA: 'DIST-001', US: 'DIST-002', FR: 'DIST-003' },
  },
  {
    id: 12,
    name: 'Gluta Américain',
    countries_available: ['CA', 'US'],
    country_distributors: { CA: 'DIST-001', US: 'DIST-002' },
  },
  {
    id: 14,
    name: 'Royal Waves Bob',
    countries_available: ['CA', 'US', 'FR', 'BE', 'CH'],
    country_distributors: { CA: 'DIST-001', US: 'DIST-002', FR: 'DIST-003', BE: 'DIST-003', CH: 'DIST-004' },
  },
  {
    id: 22,
    name: 'Perruque Champagne Glow',
    countries_available: ['CA', 'US', 'FR'],
    country_distributors: { CA: 'DIST-001', US: 'DIST-002', FR: 'DIST-003' },
  },
];

// Distributors per country
export const distributors = [
  { id: 'DIST-001', name: 'Ivalux Canada Distribution', country: 'CA', countryName: 'Canada', status: 'active', contact: 'distribution-ca@ivalux.ca' },
  { id: 'DIST-002', name: 'Ivalux USA Partners', country: 'US', countryName: 'United States', status: 'active', contact: 'us@ivaluximperial.com' },
  { id: 'DIST-003', name: 'Ivalux Europe SAS', country: 'FR', countryName: 'France', status: 'active', contact: 'europe@ivalux.fr' },
  { id: 'DIST-004', name: 'Ivalux Suisse SA', country: 'CH', countryName: 'Switzerland', status: 'active', contact: 'ch@ivalux.ch' },
];

// Country metadata for display
export const countries = [
  { code: 'CA', name: 'Canada' },
  { code: 'US', name: 'United States' },
  { code: 'FR', name: 'France' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
];

// Employees handling product distribution (mock)
export const distributionEmployees = [
  { id: 'EMP-001', name: 'Sophie Martin', role: 'Distribution Manager', countries: ['CA', 'US'], product_ids: [1, 5, 7, 12, 14, 22] },
  { id: 'EMP-002', name: 'Jean Dupont', role: 'Europe Coordinator', countries: ['FR', 'BE', 'CH'], product_ids: [1, 5, 7, 14] },
  { id: 'EMP-003', name: 'Marie Laurent', role: 'North America Support', countries: ['CA', 'US'], product_ids: [1, 5, 7, 12, 14, 22] },
];

// Mock current user role for frontend simulation
// Values: "client" | "employee" | "admin"
export const MOCK_CURRENT_USER_ROLE = 'admin';

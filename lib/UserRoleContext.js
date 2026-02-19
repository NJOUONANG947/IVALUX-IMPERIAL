'use client';

import { createContext, useContext, useState } from 'react';
import { MOCK_CURRENT_USER_ROLE } from '@/lib/distributionMockData';

/**
 * User Role Context – Frontend simulation only
 * Simulates client | employee | admin for distribution visibility.
 * No backend. No auth. Mock for UI development.
 */
const UserRoleContext = createContext({
  role: MOCK_CURRENT_USER_ROLE,
  setRole: () => {},
});

export function UserRoleProvider({ children }) {
  const [role, setRole] = useState(MOCK_CURRENT_USER_ROLE);
  return (
    <UserRoleContext.Provider value={{ role, setRole }}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const ctx = useContext(UserRoleContext);
  if (!ctx) {
    return { role: MOCK_CURRENT_USER_ROLE, setRole: () => {} };
  }
  return ctx;
}

export function isAdmin(role) {
  return role === 'admin';
}

export function isEmployeeOrAdmin(role) {
  return role === 'employee' || role === 'admin';
}

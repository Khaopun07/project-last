'use client';

import { useEffect, useState } from 'react';

import HeaderAnonymous from '@/src/app/index/components/anonymous/Header';
import FooterAnonymous from '@/src/app/index/components/anonymous/Footer';

import HeaderTeacher from '@/src/app/index/components/teacher/Header';
import FooterTeacher from '@/src/app/index/components/teacher/Footer';

import HeaderOfficer from '@/src/app/index/components/officer/Header';
import FooterOfficer from '@/src/app/index/components/officer/Footer';

type UserRole = 'teacher' | 'officer' | null;

export default function DynamicRootLayoutClient({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);

  const [isEmbedded, setIsEmbedded] = useState(false);
  const [hideHeader, setHideHeader] = useState(false);
  const [hideFooter, setHideFooter] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem('role') as UserRole | null;
    setRole(storedRole ?? null);

    const handleAuthChange = () => {
      const updatedRole = localStorage.getItem('role') as UserRole | null;
      setRole(updatedRole ?? null);
    };

    window.addEventListener('authChanged', handleAuthChange);

    const urlParams = new URLSearchParams(window.location.search);
    setIsEmbedded(urlParams.get('embedded') === 'true');
    setHideHeader(urlParams.get('hideHeader') === 'true');
    setHideFooter(urlParams.get('hideFooter') === 'true');

    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');

    setRole(null);
    window.dispatchEvent(new Event('authChanged'));
  };

  const renderHeader = () => {
    if (isEmbedded && hideHeader) return null;

    switch (role) {
      case 'teacher':
        return <HeaderTeacher onLogout={handleLogout} />;
      case 'officer':
        return <HeaderOfficer onLogout={handleLogout} />;
      default:
        return <HeaderAnonymous />;
    }
  };

  const renderFooter = () => {
    if (isEmbedded && hideFooter) return null;

    switch (role) {
      case 'teacher':
        return <FooterTeacher />;
      case 'officer':
        return <FooterOfficer />;
      default:
        return <FooterAnonymous />;
    }
  };

  return (
    <>
      {renderHeader()}
      <main className="min-h-screen">{children}</main>
      {renderFooter()}
    </>
  );
}

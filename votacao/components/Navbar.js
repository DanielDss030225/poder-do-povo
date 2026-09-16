'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VoteIcon, SettingsIcon, BrazilFlagIcon } from './Icons';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="brand-logo">
          <div className="brand-icon">
            <BrazilFlagIcon size={28} />
          </div>
          <span>PODER DO POVO</span>
        </Link>

        <div className="nav-links">
          <Link 
            href="/" 
            className={`nav-item ${pathname === '/' ? 'active' : ''}`}
          >
            <VoteIcon size={18} />
            <span>Votação</span>
          </Link>
          <Link 
            href="/admin" 
            className={`nav-item ${pathname === '/admin' ? 'active' : ''}`}
          >
            <SettingsIcon size={18} />
            <span>Painel Admin</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

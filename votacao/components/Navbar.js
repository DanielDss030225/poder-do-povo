'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VoteIcon, SettingsIcon, BrazilFlagIcon } from './Icons';

export default function Navbar({ totalVotos = null }) {
  const pathname = usePathname();

  return (
    <>
      {/* ===== DESKTOP NAVBAR ===== */}
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

      {/* ===== MOBILE TOP BAR ===== */}
      <header className="mobile-topbar">
        <Link href="/" className="mobile-brand">
          <div className="mobile-brand-icon">
            <BrazilFlagIcon size={22} />
          </div>
          <span>PODER DO POVO</span>
        </Link>

        {totalVotos !== null && (
          <div className="mobile-total-pill">
            <VoteIcon size={14} />
            <span>{totalVotos.toLocaleString('pt-BR')} votos</span>
          </div>
        )}
      </header>

      {/* ===== MOBILE BOTTOM NAVIGATION BAR ===== */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          <Link
            href="/"
            className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}
          >
            <span className="nav-icon-wrap">
              <VoteIcon size={22} color={pathname === '/' ? 'var(--brazil-green)' : 'var(--text-dim)'} />
            </span>
            <span>Votação</span>
          </Link>

          <Link
            href="/admin"
            className={`bottom-nav-item ${pathname === '/admin' ? 'active' : ''}`}
          >
            <span className="nav-icon-wrap">
              <SettingsIcon size={22} color={pathname === '/admin' ? 'var(--brazil-green)' : 'var(--text-dim)'} />
            </span>
            <span>Admin</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

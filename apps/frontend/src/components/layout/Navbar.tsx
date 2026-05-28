// apps/frontend/src/components/layout/Navbar.tsx
// Threadster — Mobile-first navbar
// Desktop = left sidebar dengan label | Mobile = bottom nav

import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'

// ─── Threadster Logo ───────────────────────────────────────────
function ThreadsterLogo({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none">
      <rect x="8" y="10" width="48" height="6" rx="3" fill="currentColor" />
      <rect x="27" y="10" width="10" height="44" rx="5" fill="currentColor" />
      <ellipse cx="32" cy="22" rx="16" ry="5" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.5" />
      <ellipse cx="32" cy="42" rx="12" ry="4" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.35" />
    </svg>
  )
}

// ─── Icons ─────────────────────────────────────────────────────
function HomeIcon({ filled }: { filled?: boolean }) {
  return filled ? (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  ) : (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 12 12 3 21 12" />
      <path d="M9 21V12h6v9" />
      <path d="M3 12v9h18v-9" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function ProfileIcon({ avatarUrl, size = 26 }: { avatarUrl?: string; size?: number }) {
  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt="avatar"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

// ─── Nav items ─────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/',              label: 'Beranda',    icon: HomeIcon },
  { path: '/post',          label: 'Buat Post',  icon: PlusIcon, isCreate: true },
  { path: '/notifications', label: 'Notifikasi', icon: HeartIcon },
]

export default function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleProfile = () => navigate(isAuthenticated ? '/edit-profile' : '/login')

  // ── Desktop Left Sidebar ──────────────────────────────────
  const DesktopNav = () => (
    <nav style={ds.sidebar}>

      {/* Logo + nama brand */}
      <div style={ds.logoWrap} onClick={() => navigate('/')}>
        <ThreadsterLogo size={28} />
        <span style={ds.brandName}>threadster</span>
      </div>

      {/* Nav items dengan label */}
      <div style={ds.navList}>
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = isActive(path)
          return (
            <button
              key={path}
              style={{
                ...ds.navItem,
                ...(active ? ds.navItemActive : {}),
              }}
              onClick={() => navigate(path)}
            >
              <span style={ds.iconWrap}>
                <Icon filled={active} />
              </span>
              <span style={{
                ...ds.label,
                ...(active ? ds.labelActive : {}),
              }}>
                {label}
              </span>
            </button>
          )
        })}

        {/* Profil */}
        <button
          style={{
            ...ds.navItem,
            ...(isActive('/edit-profile') ? ds.navItemActive : {}),
            marginTop: 'auto',
          }}
          onClick={handleProfile}
        >
          <span style={ds.iconWrap}>
            <ProfileIcon avatarUrl={user?.avatarUrl} size={26} />
          </span>
          <span style={{
            ...ds.label,
            ...(isActive('/edit-profile') ? ds.labelActive : {}),
          }}>
            {user?.name ?? 'Profil'}
          </span>
        </button>
      </div>

      {/* Logout */}
      {isAuthenticated && (
        <button
          style={ds.logoutItem}
          onClick={() => { logout(); navigate('/login') }}
        >
          <span style={ds.iconWrap}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </span>
          <span style={{ ...ds.label, color: '#555' }}>Keluar</span>
        </button>
      )}
    </nav>
  )

  // ── Mobile Bottom Nav ────────────────────────────────────
  const MobileNav = () => (
    <nav style={ms.bottomNav}>
      {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
        const active = isActive(path)
        return (
          <button
            key={path}
            style={{ ...ms.navBtn, ...(active ? ms.navBtnActive : {}) }}
            onClick={() => navigate(path)}
            aria-label={label}
          >
            <Icon filled={active} />
          </button>
        )
      })}
      {/* Avatar → edit profil */}
      <button
        style={{ ...ms.navBtn, ...(isActive('/edit-profile') ? ms.navBtnActive : {}) }}
        onClick={handleProfile}
        aria-label="Profil"
      >
        <ProfileIcon avatarUrl={user?.avatarUrl} size={26} />
      </button>
    </nav>
  )

  return (
    <>
      <div className="hidden md:block">
        <DesktopNav />
      </div>
      <div className="block md:hidden">
        <MobileNav />
      </div>
    </>
  )
}

// ─── Desktop Styles ───────────────────────────────────────────
const ds: Record<string, React.CSSProperties> = {
  sidebar: {
    position: 'fixed', top: 0, left: 0,
    height: '100vh', width: 240,
    backgroundColor: '#0d0d0d',
    borderRight: '1px solid #1c1c1c',
    display: 'flex', flexDirection: 'column',
    padding: '20px 12px 28px',
    zIndex: 100,
    boxSizing: 'border-box',
  },
  logoWrap: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '6px 12px 32px',
    cursor: 'pointer', color: '#f3f3f3',
    userSelect: 'none' as const,
  },
  brandName: {
    fontSize: 22, fontWeight: 800,
    letterSpacing: '-0.6px',
    color: '#f3f3f3',
    fontFamily: 'Georgia, "Times New Roman", serif',
  },
  navList: {
    display: 'flex', flexDirection: 'column',
    flex: 1, gap: 2, width: '100%',
  },
  navItem: {
    width: '100%',
    display: 'flex', alignItems: 'center',
    gap: 14,
    padding: '11px 12px',
    backgroundColor: 'transparent', border: 'none',
    borderRadius: 12,
    color: '#888',
    cursor: 'pointer',
    transition: 'background 0.12s, color 0.12s',
    textAlign: 'left' as const,
    fontFamily: 'inherit',
  },
  navItemActive: {
    backgroundColor: '#1e1e1e',
    color: '#f3f3f3',
  },
  iconWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    width: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: 500,
    color: '#888',
    whiteSpace: 'nowrap' as const,
    lineHeight: 1.2,
  },
  labelActive: {
    color: '#f3f3f3',
    fontWeight: 600,
  },
  logoutItem: {
    width: '100%',
    display: 'flex', alignItems: 'center',
    gap: 14,
    padding: '10px 12px',
    backgroundColor: 'transparent', border: 'none',
    borderRadius: 12,
    color: '#555',
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: 4,
    textAlign: 'left' as const,
  },
}

// ─── Mobile Styles ────────────────────────────────────────────
const ms: Record<string, React.CSSProperties> = {
  bottomNav: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    height: 56,
    backgroundColor: '#0d0d0d',
    borderTop: '1px solid #1c1c1c',
    display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    zIndex: 100,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  navBtn: {
    flex: 1, height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'transparent', border: 'none',
    color: '#555', cursor: 'pointer',
    transition: 'color 0.12s',
  },
  navBtnActive: { color: '#f3f3f3' },
}
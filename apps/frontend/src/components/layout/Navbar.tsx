// apps/frontend/src/components/layout/Navbar.tsx
// Clone Threads.com — Desktop: left sidebar 72px | Mobile: bottom bar

import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'

// ─── Threads Logo (exact clone) ────────────────────────────────
function ThreadsLogo({ size = 28 }: { size?: number }) {
  return (
    <svg viewBox="0 0 192 192" width={size} height={size} fill="currentColor" aria-label="Qura-Qura">
      <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.23c8.25.053 14.476 2.452 18.502 7.13 2.932 3.405 4.893 8.11 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.35-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.068c.224 28.617 6.882 51.447 19.788 67.852C47.292 182.358 68.882 191.805 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553Z" />
    </svg>
  )
}

// ─── Icons (exact Threads icon shapes) ────────────────────────
function HomeIcon({ filled }: { filled?: boolean }) {
  if (filled) {
    return (
      <svg width="25" height="25" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 9.00002L12.6633 1.21344C12.2766 0.89551 11.7234 0.89551 11.3367 1.21344L2 9.00002" stroke="currentColor" strokeWidth="0" fill="none"/>
        <path fillRule="evenodd" clipRule="evenodd" d="M3 9.71698V20C3 20.5523 3.44772 21 4 21H9V15C9 13.3431 10.3431 12 12 12C13.6569 12 15 13.3431 15 15V21H20C20.5523 21 21 20.5523 21 20V9.71698L12 2.29122L3 9.71698Z"/>
      </svg>
    )
  }
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.71698V20C3 20.5523 3.44772 21 4 21H9V15C9 13.3431 10.3431 12 12 12C13.6569 12 15 13.3431 15 15V21H20C20.5523 21 21 20.5523 21 20V9.71698L12 2.29122L3 9.71698Z"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function PencilIcon() {
  // Threads "new post" icon: rounded square + pencil
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function Avatar({ url, name, size = 26 }: { url?: string; name?: string; size?: number }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name ?? 'avatar'}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    )
  }
  const initials = (name ?? '?').slice(0, 1).toUpperCase()
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#2a2a2a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, color: '#aaa',
    }}>
      {initials}
    </div>
  )
}

// ─── Nav config ────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/',              label: 'Beranda',  Icon: HomeIcon },
  { path: '/search',        label: 'Cari',     Icon: SearchIcon },
  { path: '/post/new',      label: 'Buat',     Icon: PencilIcon, isCreate: true },
  { path: '/notifications', label: 'Aktivitas',Icon: HeartIcon },
]

export default function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()

  const go = (path: string) => {
    if (!isAuthenticated && path !== '/' && path !== '/search') {
      navigate('/login'); return
    }
    navigate(path)
  }

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  // ── Shared nav button JSX ──────────────────────────────────
  const NavButton = ({
    path, label, Icon, isCreate, isMobile,
  }: {
    path: string; label: string
    Icon: React.ComponentType<{ filled?: boolean }>
    isCreate?: boolean; isMobile?: boolean
  }) => {
    const active = isActive(path)
    return (
      <button
        className={`nav-btn${active ? ' nav-btn--active' : ''}${isMobile ? ' nav-btn--mobile' : ''}`}
        onClick={() => go(path)}
        aria-label={label}
        title={label}
      >
        <Icon filled={active && !isCreate} />
      </button>
    )
  }

  return (
    <>
      {/* ═══ DESKTOP SIDEBAR ══════════════════════════════════ */}
      <nav className="threads-sidebar" role="navigation" aria-label="Sidebar">
        {/* Logo */}
        <button className="nav-logo" onClick={() => navigate('/')} aria-label="Qura-Qura beranda">
          <ThreadsLogo size={28} />
        </button>

        {/* Main nav */}
        <div className="sidebar-items">
          {NAV_ITEMS.map(item => (
            <NavButton key={item.path} {...item} />
          ))}
        </div>

        {/* Profile at bottom */}
        <div className="sidebar-bottom">
          <button
            className={`nav-btn${isActive('/profile') ? ' nav-btn--active' : ''}`}
            onClick={() => isAuthenticated ? navigate('/profile') : navigate('/login')}
            title={user?.name ?? 'Profil'}
          >
            <Avatar url={user?.avatarUrl} name={user?.name} size={26} />
          </button>
          {isAuthenticated && (
            <button
              className="nav-btn nav-btn--logout"
              onClick={() => { logout(); navigate('/') }}
              title="Keluar"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </nav>

      {/* ═══ MOBILE BOTTOM BAR ════════════════════════════════ */}
      <nav className="threads-bottombar" role="navigation" aria-label="Bottom navigation">
        {NAV_ITEMS.map(item => (
          <NavButton key={item.path} {...item} isMobile />
        ))}
        <button
          className={`nav-btn nav-btn--mobile${isActive('/profile') ? ' nav-btn--active' : ''}`}
          onClick={() => isAuthenticated ? navigate('/profile') : navigate('/login')}
          aria-label="Profil"
        >
          <Avatar url={user?.avatarUrl} name={user?.name} size={26} />
        </button>
      </nav>

      <style>{`
        /* ─ Reset & base ─ */
        .threads-sidebar, .threads-bottombar { box-sizing: border-box; }
        button { cursor: pointer; background: none; border: none; padding: 0; }

        /* ─ Desktop sidebar ─ */
        .threads-sidebar {
          position: fixed; top: 0; left: 0;
          width: 72px; height: 100vh;
          background: #101010;
          border-right: 1px solid #1e1e1e;
          display: flex; flex-direction: column; align-items: center;
          padding: 12px 0 20px;
          z-index: 200;
        }
        .nav-logo {
          width: 48px; height: 48px;
          display: flex; align-items: center; justify-content: center;
          color: #f3f3f3;
          border-radius: 12px;
          margin-bottom: 8px;
          transition: background 0.15s;
        }
        .nav-logo:hover { background: #1e1e1e; }

        .sidebar-items {
          display: flex; flex-direction: column; align-items: center;
          gap: 0; flex: 1; width: 100%; padding-top: 4px;
        }
        .sidebar-bottom {
          display: flex; flex-direction: column; align-items: center; gap: 0;
        }

        /* ─ Shared nav button ─ */
        .nav-btn {
          width: 52px; height: 52px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 12px;
          color: #777;
          transition: background 0.12s, color 0.12s;
        }
        .nav-btn:hover { background: #1e1e1e; color: #f3f3f3; }
        .nav-btn--active { color: #f3f3f3; }
        .nav-btn--logout { color: #444; margin-top: 2px; }
        .nav-btn--logout:hover { color: #888; background: none; }

        /* ─ Mobile bottom bar ─ */
        .threads-bottombar {
          display: none;
          position: fixed; bottom: 0; left: 0; right: 0;
          height: 52px;
          background: #101010;
          border-top: 1px solid #1e1e1e;
          align-items: center; justify-content: space-around;
          z-index: 200;
          padding-bottom: env(safe-area-inset-bottom);
        }
        .nav-btn--mobile {
          flex: 1; height: 52px; border-radius: 0;
          width: auto;
        }
        .nav-btn--mobile:hover { background: none; }

        /* ─ Breakpoints ─ */
        @media (max-width: 767px) {
          .threads-sidebar  { display: none; }
          .threads-bottombar { display: flex; }
        }
      `}</style>
    </>
  )
}
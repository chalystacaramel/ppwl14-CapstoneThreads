// apps/frontend/src/components/layout/Navbar.tsx
// Dikerjakan: Navbar global — clone threads.com
// Layout: Desktop = left sidebar fixed | Mobile = bottom nav fixed

import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'

// ─── Threads Logo SVG ──────────────────────────────────────────
function ThreadsLogo({ size = 32 }: { size?: number }) {
  return (
    <svg viewBox="0 0 192 192" width={size} height={size} fill="currentColor">
      <path d="M141.537 88.988a66.667 66.667 0 0 0-2.518-1.143c-1.482-27.307-16.403-42.94-41.457-43.1h-.34c-14.986 0-27.449 6.396-35.12 18.036l13.779 9.452c5.73-8.695 14.724-10.548 21.348-10.548h.23c8.25.053 14.476 2.452 18.502 7.13 2.932 3.405 4.893 8.11 5.864 14.05-7.314-1.243-15.224-1.626-23.68-1.14-23.82 1.371-39.134 15.264-38.105 34.568.522 9.792 5.4 18.216 13.735 23.719 7.047 4.652 16.124 6.927 25.557 6.412 12.458-.683 22.231-5.436 29.049-14.127 5.178-6.6 8.453-15.153 9.899-25.93 5.937 3.583 10.337 8.298 12.767 13.966 4.132 9.635 4.373 25.468-8.546 38.376-11.319 11.308-24.925 16.2-45.488 16.35-22.809-.169-40.06-7.484-51.275-21.742C35.236 139.966 29.808 120.682 29.605 96c.203-24.682 5.63-43.966 16.133-57.317C56.954 24.425 74.204 17.11 97.013 16.94c22.975.17 40.526 7.52 52.171 21.847 5.71 7.026 10.015 15.86 12.853 26.162l16.147-4.308c-3.44-12.68-8.853-23.606-16.219-32.668C147.036 9.607 125.202.195 97.07 0h-.113C68.882.195 47.292 9.642 32.788 28.08 19.882 44.485 13.224 67.315 13.001 95.932L13 96v.068c.224 28.617 6.882 51.447 19.788 67.852C47.292 182.358 68.882 191.805 96.957 192h.113c24.96-.173 42.554-6.708 57.048-21.189 18.963-18.945 18.392-42.692 12.142-57.27-4.484-10.454-13.033-18.945-24.723-24.553Z" />
    </svg>
  )
}

// ─── Icons ─────────────────────────────────────────────────────
function HomeIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={filled ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
      {filled
        ? <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        : <><polyline points="3 12 12 3 21 12" /><path d="M9 21V12h6v9" /><path d="M3 12v9h18v-9" /></>
      }
    </svg>
  )
}

function SearchIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={filled ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  )
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function ProfileIcon({ avatarUrl, size = 24 }: { avatarUrl?: string; size?: number }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt="avatar"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

// ─── Nav items config ──────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/',              label: 'Beranda',   icon: HomeIcon },
  { path: '/search',       label: 'Cari',      icon: SearchIcon },
  { path: '/post/new',     label: 'Buat Post', icon: PlusIcon, isCreate: true },
  { path: '/notifications',label: 'Aktivitas', icon: HeartIcon },
]

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleNav = (path: string) => {
    if (!isAuthenticated && path !== '/' && path !== '/search') {
      navigate('/login')
      return
    }
    navigate(path)
  }

  const handleProfile = () => {
    if (!isAuthenticated) { navigate('/login'); return }
    navigate('/profile')
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  // ── Desktop Left Sidebar ────────────────────────────────────
  const DesktopNav = () => (
    <nav style={ds.sidebar}>
      {/* Logo */}
      <div style={ds.logoWrap} onClick={() => navigate('/')}>
        <ThreadsLogo size={32} />
      </div>

      {/* Nav Links */}
      <div style={ds.navLinks}>
        {NAV_ITEMS.map(({ path, label, icon: Icon, isCreate }) => {
          const active = isActive(path)
          return (
            <button
              key={path}
              style={{ ...ds.navBtn, ...(active ? ds.navBtnActive : {}) }}
              onClick={() => handleNav(path)}
              title={label}
            >
              {isCreate
                ? (
                  <span style={ds.createIconWrap}>
                    <Icon />
                  </span>
                )
                : <Icon filled={active} />
              }
            </button>
          )
        })}

        {/* Profile */}
        <button
          style={{ ...ds.navBtn, ...(isActive('/profile') ? ds.navBtnActive : {}), marginTop: 'auto' }}
          onClick={handleProfile}
          title={user?.name || 'Profil'}
        >
          <ProfileIcon avatarUrl={user?.avatarUrl} size={26} />
        </button>
      </div>

      {/* Logout (jika login) */}
      {isAuthenticated && (
        <button style={ds.logoutBtn} onClick={() => { logout(); navigate('/') }} title="Keluar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      )}
    </nav>
  )

  // ── Mobile Bottom Nav ───────────────────────────────────────
  const MobileNav = () => (
    <nav style={ms.bottomNav}>
      {NAV_ITEMS.map(({ path, label, icon: Icon, isCreate }) => {
        const active = isActive(path)
        return (
          <button
            key={path}
            style={{ ...ms.navBtn, ...(active && !isCreate ? ms.navBtnActive : {}) }}
            onClick={() => handleNav(path)}
            aria-label={label}
          >
            {isCreate
              ? <span style={ms.createIconWrap}><Icon /></span>
              : <Icon filled={active} />
            }
          </button>
        )
      })}

      {/* Profile */}
      <button
        style={{ ...ms.navBtn, ...(isActive('/profile') ? ms.navBtnActive : {}) }}
        onClick={handleProfile}
        aria-label="Profil"
      >
        <ProfileIcon avatarUrl={user?.avatarUrl} size={26} />
      </button>
    </nav>
  )

  return (
    <>
      {/* Desktop */}
      <div style={{ display: 'none' }} className="desktop-nav-wrapper">
        <DesktopNav />
      </div>
      <DesktopNav />

      {/* Mobile bottom nav */}
      <div style={ms.mobileOnly}>
        <MobileNav />
      </div>

      <style>{`
        /* Show desktop sidebar only on md+ */
        @media (max-width: 767px) {
          .threads-desktop-nav { display: none !important; }
          .threads-mobile-nav { display: flex !important; }
        }
        @media (min-width: 768px) {
          .threads-desktop-nav { display: flex !important; }
          .threads-mobile-nav { display: none !important; }
        }
      `}</style>
    </>
  )
}

// ─── Desktop Styles ────────────────────────────────────────────
const ds: Record<string, React.CSSProperties> = {
  sidebar: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: 72,
    backgroundColor: '#101010',
    borderRight: '1px solid #1e1e1e',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 24,
    zIndex: 100,
    gap: 0,
  },
  logoWrap: {
    padding: '12px 0 24px',
    cursor: 'pointer',
    color: '#f3f3f3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navLinks: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    gap: 4,
    width: '100%',
  },
  navBtn: {
    width: 52,
    height: 52,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 12,
    color: '#f3f3f3',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  navBtnActive: {
    // active via filled icon only, no bg on threads
  },
  createIconWrap: {
    width: 42,
    height: 42,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1.5px solid #333',
    borderRadius: 10,
    color: '#f3f3f3',
  },
  logoutBtn: {
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: 10,
    color: '#555',
    cursor: 'pointer',
    marginTop: 8,
  },
}

// ─── Mobile Styles ─────────────────────────────────────────────
const ms: Record<string, React.CSSProperties> = {
  mobileOnly: {
    display: 'none', // hidden on desktop — controlled by @media in JSX style tag
  },
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: '#101010',
    borderTop: '1px solid #1e1e1e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 100,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  navBtn: {
    flex: 1,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
  },
  navBtnActive: {
    color: '#f3f3f3',
  },
  createIconWrap: {
    width: 40,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1.5px solid #444',
    borderRadius: 10,
    color: '#f3f3f3',
  },
}

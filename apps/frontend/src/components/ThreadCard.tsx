// apps/frontend/src/components/ThreadCard.tsx
// Clone Threads.com — kartu postingan

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'

// ─── Types ─────────────────────────────────────────────────────
export interface ThreadPost {
  id: string
  user: {
    id: string
    name: string
    username?: string
    avatarUrl?: string
  }
  content: string
  imageUrl?: string
  likeCount: number
  commentCount: number
  createdAt: string | Date
  isLiked?: boolean
}

interface ThreadCardProps {
  post: ThreadPost
  onLike?: (postId: string) => Promise<void>
  showThread?: boolean
}

// ─── Helpers ───────────────────────────────────────────────────
function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 60)     return `${diff}d`
  if (diff < 3600)   return `${Math.floor(diff / 60)}m`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}j`
  if (diff < 604800) return `${Math.floor(diff / 86400)}h`
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

// ─── Avatar ────────────────────────────────────────────────────
function Avatar({ url, name, size = 36 }: { url?: string; name: string; size?: number }) {
  const initials = (name ?? '?').slice(0, 1).toUpperCase()
  return url ? (
    <img
      src={url} alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: '#262626',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 700, color: '#aaa', flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

// ─── Action Icons (Threads exact style) ───────────────────────
function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24"
      fill={filled ? '#ff3040' : 'none'}
      stroke={filled ? '#ff3040' : 'currentColor'}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function RepeatIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

// ─── Main Component ────────────────────────────────────────────
export default function ThreadCard({ post, onLike, showThread = false }: ThreadCardProps) {
  const [liked, setLiked]           = useState(post.isLiked ?? false)
  const [likeCount, setLikeCount]   = useState(post.likeCount)
  const [likeLoading, setLikeLoading] = useState(false)

  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const username = post.user.username
    ?? post.user.name?.toLowerCase().replace(/\s+/g, '_')
    ?? 'user'

  async function handleLike(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isAuthenticated) { navigate('/login'); return }
    if (likeLoading) return
    setLikeLoading(true)
    const next = !liked
    setLiked(next)
    setLikeCount(c => next ? c + 1 : c - 1)
    try {
      await onLike?.(post.id)
    } catch {
      setLiked(!next)
      setLikeCount(c => next ? c - 1 : c + 1)
    } finally {
      setLikeLoading(false)
    }
  }

  const goToPost    = () => navigate(`/post/${post.id}`)
  const goToProfile = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/profile/${post.user.id}`)
  }

  return (
    <article
      style={{
        display: 'flex', gap: 12,
        padding: '12px 16px 0',
        borderBottom: '1px solid #1e1e1e',
        cursor: 'default',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Left: avatar + thread line ── */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
        <button
          onClick={goToProfile}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}
        >
          <Avatar url={post.user.avatarUrl} name={post.user.name} size={36} />
        </button>
        {showThread && (
          <div style={{
            width: 2, flex: 1, minHeight: 32,
            background: '#2a2a2a', borderRadius: 1, margin: '6px 0 0',
          }} />
        )}
      </div>

      {/* ── Right: content ── */}
      <div style={{ flex: 1, minWidth: 0, paddingBottom: 12 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <button
            onClick={goToProfile}
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontWeight: 600, fontSize: 15, color: '#f3f3f3',
              fontFamily: 'inherit',
            }}
          >
            {username}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: '#555' }}>{timeAgo(post.createdAt)}</span>
            {/* More — no dropdown needed yet, just visual */}
            <button
              style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}
              aria-label="Lebih banyak"
              onClick={e => e.stopPropagation()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {post.content && (
          <p
            onClick={goToPost}
            style={{
              fontSize: 15, color: '#f3f3f3', lineHeight: 1.55,
              margin: '0 0 8px', cursor: 'pointer',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}
          >
            {post.content}
          </p>
        )}

        {/* Image */}
        {post.imageUrl && (
          <div
            onClick={goToPost}
            style={{
              marginBottom: 10, borderRadius: 12, overflow: 'hidden',
              border: '1px solid #262626', cursor: 'pointer',
              maxWidth: '100%',
            }}
          >
            <img
              src={post.imageUrl} alt="gambar postingan"
              style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 480 }}
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginLeft: -8, marginTop: 2 }}>
          {/* Like */}
          <button
            onClick={handleLike}
            aria-label="Suka"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'none', border: 'none',
              color: liked ? '#ff3040' : '#777',
              cursor: 'pointer', padding: '8px 8px',
              borderRadius: 8, fontSize: 13,
              transition: 'color 0.15s',
            }}
          >
            <HeartIcon filled={liked} />
            {likeCount > 0 && <span style={{ fontSize: 13, lineHeight: 1, color: liked ? '#ff3040' : '#777' }}>{likeCount}</span>}
          </button>

          {/* Comment */}
          <button
            onClick={e => { e.stopPropagation(); isAuthenticated ? goToPost() : navigate('/login') }}
            aria-label="Balas"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'none', border: 'none', color: '#777',
              cursor: 'pointer', padding: '8px 8px', borderRadius: 8, fontSize: 13,
              transition: 'color 0.15s',
            }}
          >
            <CommentIcon />
            {post.commentCount > 0 && <span style={{ fontSize: 13, lineHeight: 1 }}>{post.commentCount}</span>}
          </button>

          {/* Repost */}
          <button
            aria-label="Repost"
            style={{
              display: 'flex', alignItems: 'center',
              background: 'none', border: 'none', color: '#777',
              cursor: 'pointer', padding: '8px 8px', borderRadius: 8,
            }}
          >
            <RepeatIcon />
          </button>

          {/* Share */}
          <button
            aria-label="Bagikan"
            style={{
              display: 'flex', alignItems: 'center',
              background: 'none', border: 'none', color: '#777',
              cursor: 'pointer', padding: '8px 8px', borderRadius: 8,
            }}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </article>
  )
}
// apps/frontend/src/components/ThreadCard.tsx
// Clone dari Threads.com — tampilan kartu postingan
// Layout: Avatar kiri + garis vertikal, konten kanan, action icons bawah

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
  onComment?: (postId: string) => void
  showThread?: boolean // tampilkan garis bawah (ada reply)
}

// ─── Helper: format waktu relatif ─────────────────────────────
function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diff < 60) return `${diff}d`
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}j`
  if (diff < 604800) return `${Math.floor(diff / 86400)}h`
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

// ─── Icons ─────────────────────────────────────────────────────
function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#ff3040' : 'none'} stroke={filled ? '#ff3040' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

function MoreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
    </svg>
  )
}

// ─── Avatar ────────────────────────────────────────────────────
function Avatar({ url, name, size = 40 }: { url?: string; name: string; size?: number }) {
  const initials = name?.slice(0, 2).toUpperCase() || '?'
  return url ? (
    <img
      src={url}
      alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
    />
  ) : (
    <div style={{
      width: size, height: size, borderRadius: '50%', backgroundColor: '#2a2a2a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#888', fontSize: 14, fontWeight: 600, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────
export default function ThreadCard({ post, onLike, onComment, showThread = false }: ThreadCardProps) {
  const [liked, setLiked] = useState(post.isLiked ?? false)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [likeLoading, setLikeLoading] = useState(false)

  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const username = post.user.username || post.user.name?.toLowerCase().replace(/\s+/g, '_') || 'user'

  async function handleLike() {
    if (!isAuthenticated) { navigate('/login'); return }
    if (likeLoading) return
    setLikeLoading(true)
    // Optimistic update
    const newLiked = !liked
    setLiked(newLiked)
    setLikeCount(c => newLiked ? c + 1 : c - 1)
    try {
      await onLike?.(post.id)
    } catch {
      // rollback
      setLiked(!newLiked)
      setLikeCount(c => newLiked ? c - 1 : c + 1)
    } finally {
      setLikeLoading(false)
    }
  }

  function handleComment() {
    if (!isAuthenticated) { navigate('/login'); return }
    onComment ? onComment(post.id) : navigate(`/post/${post.id}`)
  }

  function goToPost() {
    navigate(`/post/${post.id}`)
  }

  function goToProfile() {
    navigate(`/profile/${post.user.id}`)
  }

  return (
    <article style={s.card}>
      {/* ── Left column: avatar + vertical thread line ── */}
      <div style={s.leftCol}>
        <div style={s.avatarWrap} onClick={goToProfile}>
          <Avatar url={post.user.avatarUrl} name={post.user.name} size={40} />
        </div>
        {showThread && <div style={s.threadLine} />}
      </div>

      {/* ── Right column: content ── */}
      <div style={s.rightCol}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <span style={s.username} onClick={goToProfile}>{username}</span>
            <span style={s.time}>{timeAgo(post.createdAt)}</span>
          </div>
          <button style={s.moreBtn} aria-label="Lebih banyak">
            <MoreIcon />
          </button>
        </div>

        {/* Content text */}
        {post.content && (
          <p style={s.content} onClick={goToPost}>{post.content}</p>
        )}

        {/* Image (jika ada) */}
        {post.imageUrl && (
          <div style={s.imageWrap} onClick={goToPost}>
            <img src={post.imageUrl} alt="post" style={s.image} />
          </div>
        )}

        {/* Action buttons */}
        <div style={s.actions}>
          {/* Like */}
          <button
            style={{ ...s.actionBtn, color: liked ? '#ff3040' : '#888' }}
            onClick={handleLike}
            aria-label="Suka"
          >
            <HeartIcon filled={liked} />
            {likeCount > 0 && <span style={s.actionCount}>{likeCount}</span>}
          </button>

          {/* Comment */}
          <button style={s.actionBtn} onClick={handleComment} aria-label="Balas">
            <CommentIcon />
            {post.commentCount > 0 && <span style={s.actionCount}>{post.commentCount}</span>}
          </button>

          {/* Repost */}
          <button style={s.actionBtn} aria-label="Repost">
            <RepeatIcon />
          </button>

          {/* Share */}
          <button style={s.actionBtn} aria-label="Bagikan">
            <ShareIcon />
          </button>
        </div>

        {/* Replies summary (opsional) */}
        {post.commentCount > 0 && (
          <button style={s.replyHint} onClick={goToPost}>
            {post.commentCount} balasan
          </button>
        )}
      </div>
    </article>
  )
}

// ─── Styles ────────────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  card: {
    display: 'flex',
    gap: 12,
    padding: '16px 16px 0',
    borderBottom: '1px solid #1e1e1e',
    backgroundColor: '#101010',
    cursor: 'default',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flexShrink: 0,
    width: 40,
  },
  avatarWrap: {
    cursor: 'pointer',
    flexShrink: 0,
  },
  threadLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#2a2a2a',
    borderRadius: 1,
    margin: '8px 0 0',
    minHeight: 40,
  },
  rightCol: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 12,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontWeight: 600,
    fontSize: 15,
    color: '#f3f3f3',
    cursor: 'pointer',
  },
  time: {
    fontSize: 13,
    color: '#555',
  },
  moreBtn: {
    background: 'none',
    border: 'none',
    color: '#555',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
  },
  content: {
    fontSize: 15,
    color: '#f3f3f3',
    lineHeight: 1.5,
    margin: '0 0 10px',
    cursor: 'pointer',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  imageWrap: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
    border: '1px solid #2a2a2a',
    cursor: 'pointer',
    maxWidth: 400,
  },
  image: {
    width: '100%',
    display: 'block',
    objectFit: 'cover',
    maxHeight: 500,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    marginLeft: -8,
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '6px 8px',
    borderRadius: 8,
    fontSize: 13,
    transition: 'color 0.15s',
  },
  actionCount: {
    fontSize: 13,
    color: 'inherit',
    lineHeight: 1,
  },
  replyHint: {
    background: 'none',
    border: 'none',
    color: '#555',
    fontSize: 13,
    cursor: 'pointer',
    padding: '4px 0',
    textAlign: 'left',
  },
}

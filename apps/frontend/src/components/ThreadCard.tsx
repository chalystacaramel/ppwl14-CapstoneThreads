// apps/frontend/src/components/ThreadCard.tsx
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth.store'
import { BACKEND_URL } from '../constants'

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
  onDelete?: (postId: string) => void
  showThread?: boolean
}

function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 60)     return `${diff}d`
  if (diff < 3600)   return `${Math.floor(diff / 60)}m`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}j`
  if (diff < 604800) return `${Math.floor(diff / 86400)}h`
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

// FIX issue #6: referrerPolicy + onError fallback untuk Google avatar
function Avatar({ url, name, size = 36 }: { url?: string; name: string; size?: number }) {
  const [imgError, setImgError] = useState(false)
  const initials = (name ?? '?').slice(0, 1).toUpperCase()
  if (url && !imgError) {
    return (
      <img
        src={url}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block', flexShrink: 0 }}
      />
    )
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: '#262626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#aaa', flexShrink: 0 }}>
      {initials}
    </div>
  )
}

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

function SendIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

// FIX issue #2: PlusIcon aktif = bold/tebal, bukan filled kotak
function PlusIconBold() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export default function ThreadCard({ post, onLike, onDelete, showThread = false }: ThreadCardProps) {
  const [liked, setLiked]             = useState(post.isLiked ?? false)
  const [likeCount, setLikeCount]     = useState(post.likeCount)
  const [likeLoading, setLikeLoading] = useState(false)
  const [showMenu, setShowMenu]       = useState(false)
  const [isEditing, setIsEditing]     = useState(false)
  const [editContent, setEditContent] = useState(post.content)
  const [content, setContent]         = useState(post.content)
  const [currentImageUrl, setCurrentImageUrl] = useState(post.imageUrl)
  // FIX issue #3: state untuk edit gambar
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [deleted, setDeleted]         = useState(false)
  const [saving, setSaving]           = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user, accessToken, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const isOwner = user && String(user.id) === String(post.user.id)
  const username = post.user.username ?? post.user.name?.toLowerCase().replace(/\s+/g, '_') ?? 'user'

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

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    setShowMenu(false)
    if (!accessToken) return
    try {
      const res = await fetch(`${BACKEND_URL}/posts/${post.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` },
      })
      if (res.ok) { setDeleted(true); onDelete?.(post.id) }
    } catch (err) { console.error('Gagal hapus post:', err) }
  }

  // FIX issue #3: handle pilih gambar baru saat edit
  function handleEditImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setEditImageFile(file)
    setEditImagePreview(URL.createObjectURL(file))
    setRemoveImage(false)
  }

  async function handleSaveEdit(e: React.MouseEvent) {
    e.stopPropagation()
    if (!accessToken || !editContent.trim()) return
    setSaving(true)
    try {
      let imageUrl: string | null | undefined = undefined

      // Upload gambar baru jika dipilih
      if (editImageFile) {
        const formData = new FormData()
        formData.append('file', editImageFile)
        const uploadRes = await fetch(`${BACKEND_URL}/posts/upload-image`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        })
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json()
          imageUrl = uploadData.imageUrl
        }
      } else if (removeImage) {
        imageUrl = null // hapus gambar
      }

      const res = await fetch(`${BACKEND_URL}/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          content: editContent,
          ...(imageUrl !== undefined ? { imageUrl } : {}),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setContent(data.content)
        if (data.imageUrl !== undefined) setCurrentImageUrl(data.imageUrl)
        else if (removeImage) setCurrentImageUrl(undefined)
        else if (editImagePreview) setCurrentImageUrl(editImagePreview)
        setIsEditing(false)
        setEditImageFile(null)
        setEditImagePreview(null)
        setRemoveImage(false)
      }
    } catch (err) {
      console.error('Gagal edit post:', err)
    } finally {
      setSaving(false)
    }
  }

  const goToPost    = () => navigate(`/post/${post.id}`)
  const goToProfile = (e: React.MouseEvent) => { e.stopPropagation(); navigate(`/profile/${post.user.id}`) }

  if (deleted) return null

  return (
    <article style={{ display: 'flex', gap: 12, padding: '12px 16px 0', borderBottom: '1px solid #1e1e1e', cursor: 'default', boxSizing: 'border-box', position: 'relative' }}>
      {/* Avatar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flexShrink: 0 }}>
        <button onClick={goToProfile} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}>
          <Avatar url={post.user.avatarUrl} name={post.user.name} size={36} />
        </button>
        {showThread && (
          <div style={{ width: 2, flex: 1, minHeight: 32, background: '#2a2a2a', borderRadius: 1, margin: '6px 0 0' }} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, paddingBottom: 12 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <button onClick={goToProfile} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 600, fontSize: 15, color: '#f3f3f3', fontFamily: 'inherit' }}>
            {username}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
            <span style={{ fontSize: 13, color: '#555' }}>{timeAgo(post.createdAt)}</span>
            <button
              style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', padding: '0 2px', lineHeight: 1 }}
              onClick={e => { e.stopPropagation(); setShowMenu(v => !v) }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>
              </svg>
            </button>
            {showMenu && (
              <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: 24, right: 0, zIndex: 100, background: '#1E1E1E', border: '1px solid #3E4042', borderRadius: 16, minWidth: 180, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                {isOwner ? (
                  <>
                    <button onClick={e => { e.stopPropagation(); setIsEditing(true); setEditContent(content); setShowMenu(false) }} style={menuItemStyle}>Edit</button>
                    <button onClick={handleDelete} style={{ ...menuItemStyle, color: '#FF2E40' }}>Hapus</button>
                  </>
                ) : (
                  <>
                    <button style={menuItemStyle}>Salin tautan</button>
                    <button style={menuItemStyle}>Tidak tertarik</button>
                    <button style={{ ...menuItemStyle, color: '#FF2E40' }}>Laporkan</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Edit mode - FIX issue #3: tambah ubah gambar */}
        {isEditing ? (
          <div onClick={e => e.stopPropagation()}>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              style={{ width: '100%', background: '#1E1E1E', border: '1px solid #3E4042', borderRadius: 12, padding: '8px 12px', color: '#F3F5F7', fontSize: 15, resize: 'none', outline: 'none', minHeight: 80, fontFamily: 'inherit', boxSizing: 'border-box' }}
            />

            {/* Preview gambar saat edit */}
            {(editImagePreview || (currentImageUrl && !removeImage)) && (
              <div style={{ position: 'relative', display: 'inline-block', marginTop: 8 }}>
                <img
                  src={editImagePreview ?? currentImageUrl}
                  style={{ maxWidth: 200, maxHeight: 150, borderRadius: 8, objectFit: 'cover', display: 'block' }}
                />
                <button
                  onClick={() => { setEditImageFile(null); setEditImagePreview(null); setRemoveImage(true) }}
                  style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', width: 22, height: 22, color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >✕</button>
              </div>
            )}

            {/* Tombol tambah/ganti gambar */}
            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '5px 12px', background: '#2a2a2a', color: '#aaa', border: '1px solid #3E4042', borderRadius: 10, cursor: 'pointer', fontSize: 12 }}
              >
                {currentImageUrl && !removeImage ? '🖼 Ganti gambar' : '🖼 Tambah gambar'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleEditImageChange} />
              <button onClick={handleSaveEdit} disabled={saving} style={{ padding: '6px 16px', background: '#F3F5F7', color: '#101010', border: 'none', borderRadius: 12, fontWeight: 600, cursor: 'pointer', fontSize: 13, opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button onClick={e => { e.stopPropagation(); setIsEditing(false); setEditImageFile(null); setEditImagePreview(null); setRemoveImage(false) }} style={{ padding: '6px 16px', background: '#2a2a2a', color: '#777', border: 'none', borderRadius: 12, cursor: 'pointer', fontSize: 13 }}>
                Batal
              </button>
            </div>
          </div>
        ) : (
          <>
            {content && (
              <p onClick={goToPost} style={{ fontSize: 15, color: '#f3f3f3', lineHeight: 1.55, margin: '0 0 8px', cursor: 'pointer', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {content}
              </p>
            )}
            {currentImageUrl && (
              <div onClick={goToPost} style={{ marginBottom: 10, borderRadius: 12, overflow: 'hidden', border: '1px solid #262626', cursor: 'pointer', maxWidth: '100%' }}>
                <img src={currentImageUrl} alt="gambar postingan" referrerPolicy="no-referrer" style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 480 }} />
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginLeft: -8, marginTop: 2 }}>
          <button onClick={handleLike} aria-label="Suka" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: liked ? '#ff3040' : '#777', cursor: 'pointer', padding: '8px 8px', borderRadius: 8, fontSize: 13 }}>
            <HeartIcon filled={liked} />
            {likeCount > 0 && <span style={{ fontSize: 13, lineHeight: 1, color: liked ? '#ff3040' : '#777' }}>{likeCount}</span>}
          </button>
          <button onClick={e => { e.stopPropagation(); if (isAuthenticated) goToPost(); else navigate('/login') }} aria-label="Balas" style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', color: '#777', cursor: 'pointer', padding: '8px 8px', borderRadius: 8, fontSize: 13 }}>
            <CommentIcon />
            {post.commentCount > 0 && <span style={{ fontSize: 13, lineHeight: 1 }}>{post.commentCount}</span>}
          </button>
          <button aria-label="Repost" style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#777', cursor: 'pointer', padding: '8px 8px', borderRadius: 8 }}>
            <RepeatIcon />
          </button>
          <button aria-label="Bagikan" style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#777', cursor: 'pointer', padding: '8px 8px', borderRadius: 8 }}>
            <SendIcon />
          </button>
        </div>
      </div>
    </article>
  )
}

const menuItemStyle: React.CSSProperties = {
  display: 'block', width: '100%', padding: '12px 16px',
  background: 'none', border: 'none', color: '#F3F5F7',
  textAlign: 'left', cursor: 'pointer', fontSize: 14,
  fontFamily: 'inherit',
}
import { usePostStore } from "@/store/usePostStore";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";

const tokens = {
  bgPrimary:     "#101010",
  bgMenu:        "#2a2a2a",
  bgComment:     "#181818",
  textPrimary:   "#F3F5F7",
  textSecondary: "#777777",
  placeholder:   "#555",
  divider:       "#2A2A2A",
  threadline:    "#333638",
} as const;

const HomePage = () => {
  const navigate    = useNavigate();
  const posts       = usePostStore((state) => state.posts);
  const deletePost  = usePostStore((state) => state.deletePost);
  const likePost    = usePostStore((state) => state.likePost);
  const addComment  = usePostStore((state) => state.addComment);
  const deleteComment = usePostStore((state) => state.deleteComment);

  const [toast, setToast]         = useState<string | null>(null);
  const [openMenu, setOpenMenu]   = useState<string | null>(null);
  const [openComments, setOpenComments] = useState<string | null>(null);
  const [commentText, setCommentText]   = useState<Record<string, string>>({});
  const menuRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string, ms = 2000) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  };

  useEffect(() => {
    const unsub = usePostStore.subscribe(
      (state) => state.lastAction,
      (action) => {
        if (action === "addPost")       showToast("✓ Thread posted!", 3000);
        if (action === "deletePost")    showToast("🗑 Thread deleted");
        if (action === "likePost")      showToast("♥ Liked!", 1500);
        if (action === "addComment")    showToast("💬 Comment added!", 1500);
        if (action === "deleteComment") showToast("🗑 Comment deleted", 1500);
      }
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSubmitComment = (postId: string) => {
    const text = commentText[postId]?.trim();
    if (!text) return;
    addComment(postId, text, "andy");
    setCommentText((prev) => ({ ...prev, [postId]: "" }));
  };

  return (
    <div style={{ backgroundColor: tokens.bgPrimary, minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#f3f3f3", color: "#101010", padding: "10px 24px", borderRadius: 20, fontSize: 14, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}

      {/* Navbar */}
      <div style={{ borderBottom: `1px solid ${tokens.divider}`, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, backgroundColor: tokens.bgPrimary, zIndex: 10 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: tokens.textPrimary }}>&#9650;</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: tokens.textPrimary }}>Threads</span>
        <button onClick={() => navigate("/new-post")}
          style={{ background: "none", border: `1px solid ${tokens.divider}`, borderRadius: 10, padding: "6px 16px", color: tokens.textPrimary, fontSize: 14, cursor: "pointer" }}>
          + New
        </button>
      </div>

      {/* Feed */}
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "0 16px" }}>
        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: tokens.textSecondary }}>
            <p style={{ fontSize: 16 }}>No threads yet.</p>
            <button onClick={() => navigate("/new-post")}
              style={{ marginTop: 16, background: tokens.textPrimary, color: tokens.bgPrimary, border: "none", borderRadius: 12, padding: "10px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
              Create your first thread
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <div key={post.id} style={{ borderBottom: `1px solid ${tokens.divider}`, padding: "16px 0" }}>
              <div style={{ display: "flex", gap: 12 }}>

                {/* Avatar col */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff" }}>
                    {post.author[0].toUpperCase()}
                  </div>
                  {openComments === post.id && (post.comments ?? []).length > 0 && (
                    <div style={{ width: 2, flex: 1, minHeight: 20, background: tokens.threadline, borderRadius: 1, marginTop: 8 }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: tokens.textPrimary }}>{post.author}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 13, color: tokens.textSecondary }}>
                        {new Date(post.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{post.isEdited && <span style={{ fontSize: 11, color: "#555", marginLeft: 4 }}>(edited)</span>}
                      </span>
                      <div style={{ position: "relative" }} ref={openMenu === post.id ? menuRef : null}>
                        <button onClick={() => setOpenMenu(openMenu === post.id ? null : post.id)}
                          style={{ background: "none", border: "none", color: tokens.textSecondary, cursor: "pointer", fontSize: 18, padding: "2px 4px", borderRadius: 6 }}>
                          ···
                        </button>
                        {openMenu === post.id && (
                          <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, background: tokens.bgMenu, borderRadius: 12, minWidth: 160, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.4)", zIndex: 100, border: "0.5px solid #3a3a3a" }}>
                            <button onClick={() => { setOpenMenu(null); navigate(`/new-post?edit=${post.id}`); }}
                              style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", color: tokens.textPrimary, fontSize: 15, textAlign: "left", cursor: "pointer" }}>
                              ✏️ Edit
                            </button>
                            <div style={{ height: "0.5px", background: "#3a3a3a" }} />
                            <button onClick={() => { setOpenMenu(null); deletePost(post.id); }}
                              style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", color: "#e05252", fontSize: 15, textAlign: "left", cursor: "pointer" }}>
                              🗑 Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {post.text && (
                    <p style={{ fontSize: 15, lineHeight: "21px", color: tokens.textPrimary, margin: "0 0 8px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {post.text}
                    </p>
                  )}

                  {post.images.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                      {post.images.map((img) => (
                        <img key={img.id} src={img.previewUrl} alt="" style={{ width: 96, height: 96, objectFit: "cover", borderRadius: 10 }} />
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                    <button onClick={() => likePost(post.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 4, color: post.likes > 0 ? "#e05252" : tokens.textSecondary, fontWeight: post.likes > 0 ? 600 : 400 }}>
                      {post.likes > 0 ? "♥" : "♡"} {post.likes > 0 ? post.likes : "Like"}
                    </button>
                    <button
                      onClick={() => setOpenComments(openComments === post.id ? null : post.id)}
                      style={{ background: "none", border: "none", color: openComments === post.id ? tokens.textPrimary : tokens.textSecondary, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 4, fontWeight: openComments === post.id ? 600 : 400 }}>
                      💬 {(post.comments ?? []).length > 0 ? (post.comments ?? []).length : "Reply"}
                    </button>
                    {[["🔁", "Repost"], ["↑", "Share"]].map(([icon, label]) => (
                      <button key={label}
                        style={{ background: "none", border: "none", color: tokens.textSecondary, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                        {icon} {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              {openComments === post.id && (
                <div style={{ marginLeft: 52, marginTop: 12 }}>

                  {/* Existing comments */}
                  {(post.comments ?? []).map((comment) => (
                    <div key={comment.id} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                        {comment.author[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, background: tokens.bgComment, borderRadius: 10, padding: "8px 12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: tokens.textPrimary }}>{comment.author}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 11, color: tokens.textSecondary }}>
                              {new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <button onClick={() => deleteComment(post.id, comment.id)}
                              style={{ background: "none", border: "none", color: tokens.textSecondary, cursor: "pointer", fontSize: 13, padding: 0, lineHeight: 1 }}>
                              ×
                            </button>
                          </div>
                        </div>
                        <p style={{ fontSize: 14, color: tokens.textPrimary, margin: 0, lineHeight: "20px" }}>{comment.text}</p>
                      </div>
                    </div>
                  ))}

                  {/* Comment input */}
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#a855f7,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                      A
                    </div>
                    <div style={{ flex: 1, display: "flex", gap: 8, alignItems: "center", background: tokens.bgComment, borderRadius: 20, padding: "6px 12px", border: `0.5px solid ${tokens.divider}` }}>
                      <input
                        value={commentText[post.id] ?? ""}
                        onChange={(e) => setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmitComment(post.id)}
                        placeholder="Add a comment..."
                        style={{ flex: 1, background: "none", border: "none", outline: "none", color: tokens.textPrimary, fontSize: 14 }}
                      />
                      <button
                        onClick={() => handleSubmitComment(post.id)}
                        disabled={!commentText[post.id]?.trim()}
                        style={{ background: "none", border: "none", color: commentText[post.id]?.trim() ? tokens.textPrimary : tokens.placeholder, cursor: commentText[post.id]?.trim() ? "pointer" : "default", fontSize: 13, fontWeight: 600, padding: 0 }}>
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;

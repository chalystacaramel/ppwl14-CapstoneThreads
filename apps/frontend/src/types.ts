export interface UserData {
    name: string;
    username?: string;
    email: string;
    avatar_url: string;
    bio: string;
    provider: string;
    created_at?: string;
    updated_at?: string;
}


// =========================
// ENUMS
// =========================

export type Provider = "email" | "google";

export type NotificationType =
    | "like"
    | "comment"
    | "follow";


// =========================
// USER
// =========================

export interface User {
    id: number;

    name: string;
    username: string;
    email: string;

    password?: string | null;

    avatar_url?: string | null;
    image?: File;
    bio?: string | null;

    provider?: Provider;
    provider_id?: string | null;

    email_verified_at?: string | Date | null;

    created_at?: string | Date;
    updated_at?: string | Date;

    // Relations
    posts?: Post[];
    post_likes?: PostLike[];
    comments?: Comment[];

    notifications?: Notification[];
    actions?: Notification[];
}


// =========================
// POST
// =========================

export interface Post {
    id: number;

    user_id: number;

    content: string;
    image_url?: string;

    created_at: string | Date;
    updated_at: string | Date;

    // Relations
    user?: User;

    likes?: PostLike[];
    comments?: Comment[];

    notifications?: Notification[];
    _count: {
        comments: number,
        likes: number
    }
}


// =========================
// POST LIKE
// =========================

export interface PostLike {
    id: number;

    post_id: number;
    user_id: number;

    created_at: string | Date;

    // Relations
    post?: Post;
    user?: User;
}


// =========================
// COMMENT
// =========================

export interface Comment {
    id: number;

    post_id: number;
    user_id: number;

    parent_comment_id?: number | null;

    content: string;

    created_at: string | Date;
    updated_at: string | Date;

    // Relations
    post?: Post;
    user?: User;

    parent_comment?: Comment | null;
    replies?: Comment[];

    notifications?: Notification[];
}


// =========================
// NOTIFICATION
// =========================

export interface Notification {
    id: number;

    user_id: number;
    actor_id: number;

    type: NotificationType;

    post_id?: number | null;
    comment_id?: number | null;

    is_read: boolean;

    created_at: string | Date;

    // Relations
    user?: User;
    actor: User;

    post?: Post | null;
    comment?: Comment | null;
}


// =========================
// AUTH
// =========================

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}


// =========================
// API RESPONSE
// =========================

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    count?: number; // Ditambahkan untuk menampung response unread-count (Notif)
}


// =========================
// PAGINATION
// =========================

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}
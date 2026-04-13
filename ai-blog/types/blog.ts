export interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  tags: string | null; // JSON string of string[]
  featured_image: string | null;
  status: 'draft' | 'published';
  created_at: number;
  updated_at: number;
  published_at: number | null;
  view_count: number;
}

export interface BlogWithTags extends Omit<Blog, 'tags'> {
  tags: string[];
}

export interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  status: 'pending' | 'active' | 'unsubscribed';
  confirmation_token: string | null;
  unsubscribe_token: string | null;
  created_at: number;
  confirmed_at: number | null;
}

export interface EmailLog {
  id: number;
  subscriber_id: number;
  blog_id: number;
  status: 'sent' | 'failed' | 'bounced';
  sent_at: number;
  error_message: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AdminStats {
  totalBlogs: number;
  publishedBlogs: number;
  totalSubscribers: number;
  activeSubscribers: number;
  totalViews: number;
}

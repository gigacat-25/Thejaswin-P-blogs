export const runtime = 'edge';
import BlogEditor from '@/components/admin/BlogEditor';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'New Blog Post' };

export default function NewBlogPage() {
  return <BlogEditor mode="create" />;
}

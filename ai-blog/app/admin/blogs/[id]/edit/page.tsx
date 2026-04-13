import { getBlogByIdAdmin } from '@/lib/db';
import { notFound } from 'next/navigation';
import BlogEditor from '@/components/admin/BlogEditor';
import type { Metadata } from 'next';

interface Props { params: Promise<{ id: string }> }

export const metadata: Metadata = { title: 'Edit Blog Post' };

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;
  const blog = getBlogByIdAdmin(parseInt(id));
  if (!blog) notFound();

  return (
    <BlogEditor
      mode="edit"
      initialData={{
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        excerpt: blog.excerpt || '',
        tags: blog.tags,
        status: blog.status,
        featured_image: blog.featured_image || '',
      }}
    />
  );
}

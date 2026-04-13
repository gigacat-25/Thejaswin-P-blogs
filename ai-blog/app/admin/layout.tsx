import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cs = await cookies();
  const token = cs.get('admin_token')?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload) redirect('/admin/login');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      <AdminSidebar />
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px', maxWidth: 'calc(100vw - 240px)' }}>
        {children}
      </main>
    </div>
  );
}

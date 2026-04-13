import { Blog, BlogWithTags, Subscriber, AdminStats, PaginatedResponse } from '@/types/blog';
import { parseTags } from '@/lib/utils';
let localDb: any = null;

async function getLocalDb() {
  if (!localDb) {
    const Database = (await import('better-sqlite3')).default;
    const path = (await import('path')).default;
    const fs = (await import('fs')).default;
    const dbPath = path.join(process.cwd(), '.tmp', 'blog.db');
    const tmpDir = path.dirname(dbPath);
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    localDb = new Database(dbPath);
    localDb.pragma('journal_mode = WAL');
    localDb.pragma('foreign_keys = ON');

    const migrationPath = path.join(process.cwd(), 'migrations', '0001_initial.sql');
    if (fs.existsSync(migrationPath)) {
      const migration = fs.readFileSync(migrationPath, 'utf-8');
      localDb.exec(migration);
    }
  }
  return localDb;
}

// Helper to get D1 from request context (Cloudflare Pages)
async function getD1() {
  try {
    const { getRequestContext } = await import('@cloudflare/next-on-pages');
    const context = getRequestContext();
    return (context.env as any).DB as D1Database;
  } catch {
    return null;
  }
}

// Wrapper for queries to handle both D1 and SQLite
async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
  const d1 = await getD1();
  if (d1) {
    const result = await d1.prepare(sql).bind(...params).all();
    return result.results as T[];
  } else {
    const db = await getLocalDb();
    return db.prepare(sql).all(...params) as T[];
  }
}

async function getRow<T>(sql: string, params: any[] = []): Promise<T | null> {
  const d1 = await getD1();
  if (d1) {
    return await d1.prepare(sql).bind(...params).first() as T | null;
  } else {
    const db = await getLocalDb();
    return db.prepare(sql).get(...params) as T | null;
  }
}

async function execute(sql: string, params: any[] = []): Promise<{ lastInsertRowid: number | null, changes: number }> {
  const d1 = await getD1();
  if (d1) {
    const result = await d1.prepare(sql).bind(...params).run();
    return { lastInsertRowid: result.meta.last_row_id ?? null, changes: result.meta.changes };
  } else {
    const db = await getLocalDb();
    const result = db.prepare(sql).run(...params);
    return { lastInsertRowid: result.lastInsertRowid as number, changes: result.changes };
  }
}

// ---- Blog Queries ----

export async function getPublishedBlogs(page = 1, perPage = 10, tag?: string, search?: string): Promise<PaginatedResponse<BlogWithTags>> {
  const offset = (page - 1) * perPage;

  let where = "status = 'published'";
  const params: (string | number)[] = [];

  if (search) {
    where += " AND (title LIKE ? OR content LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }
  if (tag) {
    where += " AND tags LIKE ?";
    params.push(`%${tag}%`);
  }

  const countRow = await getRow<{ count: number }>(`SELECT COUNT(*) as count FROM blogs WHERE ${where}`, params);
  const total = countRow?.count ?? 0;

  const rows = await query<Blog>(
    `SELECT * FROM blogs WHERE ${where} ORDER BY published_at DESC LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  );

  return {
    data: rows.map(b => ({ ...b, tags: parseTags(b.tags as string) })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getBlogBySlug(slug: string): Promise<BlogWithTags | null> {
  const row = await getRow<Blog>("SELECT * FROM blogs WHERE slug = ? AND status = 'published'", [slug]);
  if (!row) return null;
  return { ...row, tags: parseTags(row.tags as string) };
}

export async function getAllBlogsAdmin(page = 1, perPage = 10): Promise<PaginatedResponse<BlogWithTags>> {
  const offset = (page - 1) * perPage;
  const countRow = await getRow<{ count: number }>("SELECT COUNT(*) as count FROM blogs");
  const total = countRow?.count ?? 0;
  const rows = await query<Blog>("SELECT * FROM blogs ORDER BY updated_at DESC LIMIT ? OFFSET ?", [perPage, offset]);
  return {
    data: rows.map(b => ({ ...b, tags: parseTags(b.tags as string) })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export async function getBlogByIdAdmin(id: number): Promise<BlogWithTags | null> {
  const row = await getRow<Blog>("SELECT * FROM blogs WHERE id = ?", [id]);
  if (!row) return null;
  return { ...row, tags: parseTags(row.tags as string) };
}

export async function createBlog(data: Omit<Blog, 'id' | 'view_count'>): Promise<Blog> {
  const result = await execute(
    `INSERT INTO blogs (title, slug, content, excerpt, tags, featured_image, status, created_at, updated_at, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title, data.slug, data.content, data.excerpt, data.tags,
      data.featured_image, data.status, data.created_at, data.updated_at, data.published_at
    ]
  );
  return (await getBlogByIdAdmin(result.lastInsertRowid as number))! as unknown as Blog;
}

export async function updateBlog(id: number, data: Partial<Omit<Blog, 'id'>>): Promise<Blog | null> {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = Object.values(data);
  await execute(`UPDATE blogs SET ${fields} WHERE id = ?`, [...values, id]);
  return (await getBlogByIdAdmin(id)) as unknown as Blog;
}

export async function deleteBlog(id: number): Promise<void> {
  await execute("DELETE FROM blogs WHERE id = ?", [id]);
}

export async function incrementViewCount(slug: string): Promise<void> {
  await execute("UPDATE blogs SET view_count = view_count + 1 WHERE slug = ?", [slug]);
}

export async function getRelatedBlogs(currentId: number, tags: string[], limit = 3): Promise<BlogWithTags[]> {
  if (tags.length === 0) {
    const rows = await query<Blog>(
      "SELECT * FROM blogs WHERE status = 'published' AND id != ? ORDER BY published_at DESC LIMIT ?",
      [currentId, limit]
    );
    return rows.map(b => ({ ...b, tags: parseTags(b.tags as string) }));
  }
  const tagConditions = tags.map(() => "tags LIKE ?").join(' OR ');
  const tagParams = tags.map(t => `%${t}%`);
  const rows = await query<Blog>(
    `SELECT * FROM blogs WHERE status = 'published' AND id != ? AND (${tagConditions}) ORDER BY published_at DESC LIMIT ?`,
    [currentId, ...tagParams, limit]
  );
  return rows.map(b => ({ ...b, tags: parseTags(b.tags as string) }));
}

// ---- Subscriber Queries ----

export async function createSubscriber(email: string, name: string | null, confirmToken: string, unsubToken: string): Promise<Subscriber> {
  const ts = Math.floor(Date.now() / 1000);
  const result = await execute(
    `INSERT INTO subscribers (email, name, status, confirmation_token, unsubscribe_token, created_at)
     VALUES (?, ?, 'pending', ?, ?, ?)`,
    [email, name, confirmToken, unsubToken, ts]
  );
  return (await getRow<Subscriber>("SELECT * FROM subscribers WHERE id = ?", [result.lastInsertRowid]))!;
}

export async function confirmSubscriber(token: string): Promise<boolean> {
  const ts = Math.floor(Date.now() / 1000);
  const result = await execute(
    "UPDATE subscribers SET status = 'active', confirmed_at = ? WHERE confirmation_token = ? AND status = 'pending'",
    [ts, token]
  );
  return result.changes > 0;
}

export async function unsubscribeByToken(token: string): Promise<boolean> {
  const result = await execute(
    "UPDATE subscribers SET status = 'unsubscribed' WHERE unsubscribe_token = ?",
    [token]
  );
  return result.changes > 0;
}

export async function getAllSubscribersAdmin(page = 1, perPage = 20): Promise<PaginatedResponse<Subscriber>> {
  const offset = (page - 1) * perPage;
  const countRow = await getRow<{ count: number }>("SELECT COUNT(*) as count FROM subscribers");
  const total = countRow?.count ?? 0;
  const rows = await query<Subscriber>("SELECT * FROM subscribers ORDER BY created_at DESC LIMIT ? OFFSET ?", [perPage, offset]);
  return { data: rows, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getActiveSubscribers(): Promise<Subscriber[]> {
  return await query<Subscriber>("SELECT * FROM subscribers WHERE status = 'active'");
}

export async function deleteSubscriber(id: number): Promise<void> {
  await execute("DELETE FROM subscribers WHERE id = ?", [id]);
}

export async function getSubscriberByEmail(email: string): Promise<Subscriber | null> {
  return await getRow<Subscriber>("SELECT * FROM subscribers WHERE email = ?", [email]);
}

// ---- Stats ----

export async function getAdminStats(): Promise<AdminStats> {
  const total = (await getRow<{ c: number }>("SELECT COUNT(*) as c FROM blogs"))?.c ?? 0;
  const published = (await getRow<{ c: number }>("SELECT COUNT(*) as c FROM blogs WHERE status = 'published'"))?.c ?? 0;
  const totalSubs = (await getRow<{ c: number }>("SELECT COUNT(*) as c FROM subscribers"))?.c ?? 0;
  const activeSubs = (await getRow<{ c: number }>("SELECT COUNT(*) as c FROM subscribers WHERE status = 'active'"))?.c ?? 0;
  const views = (await getRow<{ v: number | null }>("SELECT SUM(view_count) as v FROM blogs"))?.v ?? 0;
  return { totalBlogs: total, publishedBlogs: published, totalSubscribers: totalSubs, activeSubscribers: activeSubs, totalViews: views };
}


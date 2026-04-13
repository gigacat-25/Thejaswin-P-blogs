import { Blog, BlogWithTags, Subscriber, AdminStats, PaginatedResponse } from '@/types/blog';
import { parseTags } from '@/lib/utils';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Local SQLite DB for development (mirrors D1 schema)
let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    const dbPath = path.join(process.cwd(), '.tmp', 'blog.db');
    // Ensure tmp dir exists
    const tmpDir = path.dirname(dbPath);
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Run migration if tables don't exist
    const migrationPath = path.join(process.cwd(), 'migrations', '0001_initial.sql');
    if (fs.existsSync(migrationPath)) {
      const migration = fs.readFileSync(migrationPath, 'utf-8');
      db.exec(migration);
    }
  }
  return db;
}

// ---- Blog Queries ----

export function getPublishedBlogs(page = 1, perPage = 10, tag?: string, search?: string): PaginatedResponse<BlogWithTags> {
  const db = getDb();
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

  const countRow = db.prepare(`SELECT COUNT(*) as count FROM blogs WHERE ${where}`).get(...params) as { count: number };
  const total = countRow.count;

  const rows = db.prepare(
    `SELECT * FROM blogs WHERE ${where} ORDER BY published_at DESC LIMIT ? OFFSET ?`
  ).all(...params, perPage, offset) as Blog[];

  return {
    data: rows.map(b => ({ ...b, tags: parseTags(b.tags as string) })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export function getBlogBySlug(slug: string): BlogWithTags | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM blogs WHERE slug = ? AND status = 'published'").get(slug) as Blog | undefined;
  if (!row) return null;
  return { ...row, tags: parseTags(row.tags as string) };
}

export function getAllBlogsAdmin(page = 1, perPage = 10): PaginatedResponse<BlogWithTags> {
  const db = getDb();
  const offset = (page - 1) * perPage;
  const countRow = db.prepare("SELECT COUNT(*) as count FROM blogs").get() as { count: number };
  const total = countRow.count;
  const rows = db.prepare("SELECT * FROM blogs ORDER BY updated_at DESC LIMIT ? OFFSET ?").all(perPage, offset) as Blog[];
  return {
    data: rows.map(b => ({ ...b, tags: parseTags(b.tags as string) })),
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}

export function getBlogByIdAdmin(id: number): BlogWithTags | null {
  const db = getDb();
  const row = db.prepare("SELECT * FROM blogs WHERE id = ?").get(id) as Blog | undefined;
  if (!row) return null;
  return { ...row, tags: parseTags(row.tags as string) };
}

export function createBlog(data: Omit<Blog, 'id' | 'view_count'>): Blog {
  const db = getDb();
  const result = db.prepare(
    `INSERT INTO blogs (title, slug, content, excerpt, tags, featured_image, status, created_at, updated_at, published_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    data.title, data.slug, data.content, data.excerpt, data.tags,
    data.featured_image, data.status, data.created_at, data.updated_at, data.published_at
  );
  return getBlogByIdAdmin(result.lastInsertRowid as number)! as unknown as Blog;
}

export function updateBlog(id: number, data: Partial<Omit<Blog, 'id'>>): Blog | null {
  const db = getDb();
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = Object.values(data);
  db.prepare(`UPDATE blogs SET ${fields} WHERE id = ?`).run(...values, id);
  return getBlogByIdAdmin(id) as unknown as Blog;
}

export function deleteBlog(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM blogs WHERE id = ?").run(id);
}

export function incrementViewCount(slug: string): void {
  const db = getDb();
  db.prepare("UPDATE blogs SET view_count = view_count + 1 WHERE slug = ?").run(slug);
}

export function getRelatedBlogs(currentId: number, tags: string[], limit = 3): BlogWithTags[] {
  const db = getDb();
  if (tags.length === 0) {
    const rows = db.prepare(
      "SELECT * FROM blogs WHERE status = 'published' AND id != ? ORDER BY published_at DESC LIMIT ?"
    ).all(currentId, limit) as Blog[];
    return rows.map(b => ({ ...b, tags: parseTags(b.tags as string) }));
  }
  const tagConditions = tags.map(() => "tags LIKE ?").join(' OR ');
  const tagParams = tags.map(t => `%${t}%`);
  const rows = db.prepare(
    `SELECT * FROM blogs WHERE status = 'published' AND id != ? AND (${tagConditions}) ORDER BY published_at DESC LIMIT ?`
  ).all(currentId, ...tagParams, limit) as Blog[];
  return rows.map(b => ({ ...b, tags: parseTags(b.tags as string) }));
}

// ---- Subscriber Queries ----

export function createSubscriber(email: string, name: string | null, confirmToken: string, unsubToken: string): Subscriber {
  const db = getDb();
  const ts = Math.floor(Date.now() / 1000);
  const result = db.prepare(
    `INSERT INTO subscribers (email, name, status, confirmation_token, unsubscribe_token, created_at)
     VALUES (?, ?, 'pending', ?, ?, ?)`
  ).run(email, name, confirmToken, unsubToken, ts);
  return db.prepare("SELECT * FROM subscribers WHERE id = ?").get(result.lastInsertRowid) as Subscriber;
}

export function confirmSubscriber(token: string): boolean {
  const db = getDb();
  const ts = Math.floor(Date.now() / 1000);
  const result = db.prepare(
    "UPDATE subscribers SET status = 'active', confirmed_at = ? WHERE confirmation_token = ? AND status = 'pending'"
  ).run(ts, token);
  return result.changes > 0;
}

export function unsubscribeByToken(token: string): boolean {
  const db = getDb();
  const result = db.prepare(
    "UPDATE subscribers SET status = 'unsubscribed' WHERE unsubscribe_token = ?"
  ).run(token);
  return result.changes > 0;
}

export function getAllSubscribersAdmin(page = 1, perPage = 20): PaginatedResponse<Subscriber> {
  const db = getDb();
  const offset = (page - 1) * perPage;
  const countRow = db.prepare("SELECT COUNT(*) as count FROM subscribers").get() as { count: number };
  const total = countRow.count;
  const rows = db.prepare("SELECT * FROM subscribers ORDER BY created_at DESC LIMIT ? OFFSET ?").all(perPage, offset) as Subscriber[];
  return { data: rows, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export function getActiveSubscribers(): Subscriber[] {
  const db = getDb();
  return db.prepare("SELECT * FROM subscribers WHERE status = 'active'").all() as Subscriber[];
}

export function deleteSubscriber(id: number): void {
  const db = getDb();
  db.prepare("DELETE FROM subscribers WHERE id = ?").run(id);
}

export function getSubscriberByEmail(email: string): Subscriber | null {
  const db = getDb();
  return db.prepare("SELECT * FROM subscribers WHERE email = ?").get(email) as Subscriber | null;
}

// ---- Stats ----

export function getAdminStats(): AdminStats {
  const db = getDb();
  const total = (db.prepare("SELECT COUNT(*) as c FROM blogs").get() as { c: number }).c;
  const published = (db.prepare("SELECT COUNT(*) as c FROM blogs WHERE status = 'published'").get() as { c: number }).c;
  const totalSubs = (db.prepare("SELECT COUNT(*) as c FROM subscribers").get() as { c: number }).c;
  const activeSubs = (db.prepare("SELECT COUNT(*) as c FROM subscribers WHERE status = 'active'").get() as { c: number }).c;
  const views = (db.prepare("SELECT SUM(view_count) as v FROM blogs").get() as { v: number | null }).v ?? 0;
  return { totalBlogs: total, publishedBlogs: published, totalSubscribers: totalSubs, activeSubscribers: activeSubs, totalViews: views };
}

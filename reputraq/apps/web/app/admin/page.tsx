import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { AdminContent } from './AdminContent';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function AdminPanel() {
  let initialUsers: any[] = [];

  try {
    const database = await db;
    initialUsers = await database
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        companyName: users.companyName,
        plan: users.plan,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));
  } catch (error) {
    console.error('Failed to pre-fetch users on server:', error);
    // Continue with empty list, client will handle refresh or error display
  }

  return (
    <AdminContent initialUsers={JSON.parse(JSON.stringify(initialUsers))} />
  );
}

'use server';

import { cookies } from 'next/headers';
import { db } from '@/lib/db';

export async function getUsers() {
  return db.user.select();
}

export async function login(userId: number) {
  const users = await db.user.select();
  const user = users.find(u => u.id === userId);
  if (!user) return;

  const cookieStore = await cookies();

  cookieStore.set('user', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('user');
}

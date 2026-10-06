import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Returns the logged-in user, or redirects to /login.
 * Use this in server components that require authentication.
 */
export async function getUser() {
  const cookieStore = await cookies();
  const raw = cookieStore.get('user')?.value;
  const user = raw ? JSON.parse(raw) : null;

  if (!user) redirect('/login');
  return user;
}

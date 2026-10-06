'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/actions';

export function LogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await logout();
          router.refresh();
          router.push('/');
        });
      }}
    >
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        Sign out
      </Button>
    </form>
  );
}

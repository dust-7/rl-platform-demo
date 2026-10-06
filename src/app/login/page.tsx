'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getUsers, login } from '@/app/actions';
import type { User } from '@/lib/db/schema';

export default function LoginPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const handleLogin = (userId: number) => {
    startTransition(async () => {
      await login(userId);
      router.refresh();
      router.push('/');
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Select a user to continue
          </p>
        </div>

        {/* User Selection */}
        <div className="space-y-3">
          {users.map((user) => (
            <Button
              key={user.name}
              variant="outline"
              size="lg"
              className="w-full justify-between text-base"
              disabled={pending}
              onClick={() => handleLogin(user.id)}
            >
              <span className="font-medium text-zinc-900">{user.name}</span>
              <span className="text-sm text-zinc-500">{user.role}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

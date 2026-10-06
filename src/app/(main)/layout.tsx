import { LogoutButton } from '@/components/logout-button';
import { getUser } from '@/lib/session';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  
  return (
    <>
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-end gap-4 px-4 sm:px-6 lg:px-8">
          <span className="text-sm text-zinc-600">
            <strong>{user.name}</strong> ({user.role})
          </span>
          <LogoutButton />
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </>
  );
}

import { getApplications } from '@/app/actions';
import { getUser } from '@/lib/session';
import { ApplicationCard } from '@/components/applications/application-card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function HomePage() {
  const user = await getUser();
  const applications = await getApplications(user.id, user.role);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">
          {user.role === 'Operator' ? 'My License Applications' : 'License Applications'}
        </h1>
        {user.role === 'Operator' && (
          <Link href="/applications/new">
            <Button>New Application</Button>
          </Link>
        )}
      </div>

      {applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
          <svg
            className="mx-auto size-12 text-zinc-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h2 className="mt-4 text-lg font-medium text-zinc-900">No applications yet</h2>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications.map(app => (
            <ApplicationCard
              key={app.id}
              id={app.id}
              status={user.role === 'Operator' ? app.statusOperator : app.statusOfficer}
              created_at={app.created_at}
            />
          ))}
        </div>
      )}
    </div>
  );
}

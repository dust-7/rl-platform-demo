import Link from 'next/link';
import { StatusBadge } from './status-badge';

interface ApplicationCardProps {
  id: number;
  status?: string;
  created_at: Date;
}

export function ApplicationCard({ id, status, created_at }: ApplicationCardProps) {
  return (
    <Link
      href={`/applications/${id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-zinc-900">
            License Application #{id}
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Created: {formatDate(created_at)}
          </p>
        </div>
        {status && <StatusBadge status={status} />}
      </div>
    </Link>
  );
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  Rejected: 'bg-red-100 text-red-700 border-red-200',
};

export function StatusBadge({ status }: { status: string }) {
  const colorClass = statusColors[status] || 'bg-gray-100 text-gray-700 border-gray-200';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        colorClass,
      )}
    >
      {status}
    </span>
  );
}

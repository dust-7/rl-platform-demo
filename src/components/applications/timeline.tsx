import { cn } from '@/lib/utils';
import type { Status } from '@/lib/db/schema';

interface TimelineItem {
  id: number;
  application_id: number;
  status_id: number;
  created_by: number;
  created_at: Date;
  status?: Status;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function Timeline({ items, userId, role }: { items: TimelineItem[]; userId: number; role: 'Operator' | 'Officer' }) {
  return (
    <div className="space-y-3">
      {items.reverse().map((item, index) => {
        const isCreatedByMe = item.created_by === userId;
        const label = isCreatedByMe ? role : role === 'Operator' ? 'Officer' : 'Operator';
        const action = label === 'Operator' ? item.status?.operator : item.status?.officer;
        const displayAction = action || 'Status updated';

        return (
          <div key={item.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'size-3 rounded-full border-2',
                  index === 0
                    ? 'border-blue-500 bg-blue-500'
                    : isCreatedByMe
                      ? 'border-blue-400 bg-blue-100'
                      : 'border-zinc-400 bg-zinc-100',
                )}
              />
              {index < items.length - 1 && (
                <div className="h-full w-px bg-zinc-200" />
              )}
            </div>
            <div className="pt-0.5">
              <p className="text-sm text-zinc-800">
                <strong>{label}</strong> — {displayAction}
              </p>
              <p className="text-xs text-zinc-500">
                {formatDate(item.created_at)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

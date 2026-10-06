'use client';

import { useTransition } from 'react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { requestResubmit } from '@/app/(main)/applications/actions';

interface ResubmitFormProps {
  applicationId: number;
  userId: number;
  userRole: 'Operator' | 'Officer';
}

export function ResubmitForm({ applicationId, userId, userRole }: ResubmitFormProps) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Collect comments from textareas
    const comments: { field_id: number; comment: string }[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('comment-')) {
        const fieldId = parseInt(key.replace('comment-', ''), 10);
        const comment = typeof value === 'string' ? value : '';
        if (comment.trim().length > 0) {
          comments.push({ field_id: fieldId, comment });
        }
      }
    }

    if (comments.length === 0) {
      alert('At least one comment must be filled.');
      return;
    }

    startTransition(async () => {
      const result = await requestResubmit(applicationId, userId, userRole, comments);
      if (result?.error) {
        alert(result.error);
      } else {
        formRef.current?.reset();
      }
    });
  };

  return (
    <form ref={formRef} id="resubmit-form" onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row gap-2">
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending ? 'Submitting...' : 'Request to Resubmit'}
        </Button>
      </div>
    </form>
  );
}

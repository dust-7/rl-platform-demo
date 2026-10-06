'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createApplication } from '@/app/actions';
import type { Field, FieldType } from '@/lib/db/schema';

interface ApplicationFormProps {
  fields: (Field & { type: FieldType })[];
  operatorId: number;
}

export function ApplicationForm({ fields, operatorId }: ApplicationFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<number, string>>({});
  const [errors, setErrors] = useState<Set<number>>(new Set());

  const setFieldValue = (fieldId: number, value: string) => {
    setValues(prev => ({ ...prev, [fieldId]: value }));
    setErrors(prev => {
      const next = new Set(prev);
      next.delete(fieldId);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields are filled
    const missing = fields.filter(f => !values[f.id]);
    if (missing.length > 0) {
      setErrors(new Set(missing.map(f => f.id)));
      return;
    }
    setErrors(new Set());

    const fieldValues = fields.map(f => ({
      field_id: f.id,
      value: values[f.id],
    }));

    startTransition(async () => {
      const app = await createApplication(operatorId, fieldValues);
      if (app) {
        router.push(`/applications/${app.id}`);
      }
    });
  };

  const handleFileChange = (fieldId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrors(prev => {
      const next = new Set(prev);
      next.delete(fieldId);
      return next;
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setValues(prev => ({ ...prev, [fieldId]: JSON.stringify({ filename: file.name, dataUrl: result }) }));
    };
    reader.readAsDataURL(file);
  };

  const parseFileValue = (value: string | undefined): { filename: string; dataUrl: string } | null => {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-6">
        {fields.map(field => (
          <div key={field.id}>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
              {field.title}
              {errors.has(field.id) && <span className="text-xs font-bold text-red-500">Required</span>}
            </label>

            {field.type.value === 'text' ? (
              <input
                type="text"
                className={`w-full rounded-lg border ${errors.has(field.id) ? 'border-red-500' : 'border-zinc-300'} px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
                placeholder={`Enter ${field.title.toLowerCase()}`}
                onChange={e => setFieldValue(field.id, e.target.value)}
              />
            ) : field.type.value === 'file' ? (
              <div className="flex items-center gap-3">
                <label className={`relative cursor-pointer rounded-lg border ${errors.has(field.id) ? 'border-red-500' : 'border-zinc-300'} bg-white transition-colors hover:bg-zinc-50`}>
                  <input
                    type="file"
                    className="hidden"
                    onChange={e => handleFileChange(field.id, e)}
                  />
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors max-w-xs">
                    {parseFileValue(values[field.id]) ? (
                      <>
                        <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="truncate">{parseFileValue(values[field.id])!.filename}</span>
                      </>
                    ) : (
                      <>
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload file
                      </>
                    )}
                  </span>
                </label>
                {values[field.id] && (
                  <button
                    type="button"
                    onClick={() => {
                      setValues(prev => ({ ...prev, [field.id]: '' }));
                      setErrors(prev => {
                        const next = new Set(prev);
                        next.delete(field.id);
                        return next;
                      });
                    }}
                    className="text-xs text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={pending}
          className="min-w-32"
        >
          {pending ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
    </form>
  );
}

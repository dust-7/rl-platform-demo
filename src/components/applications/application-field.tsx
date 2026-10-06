'use client';

import { FileDownloadLink } from '@/components/applications/file-download-link';
import { useState } from 'react';
import type { Field, FieldOperator, FieldOfficer } from '@/lib/db/schema';

interface ApplicationFieldProps {
  fv: FieldOperator;
  field: Field & { type: { value: string } };
  isOfficerUnderReview: boolean;
  isPendingPresiteResubmission?: boolean;
  isResponding?: boolean;
  isRecentlyCreated?: boolean;
  comment?: FieldOfficer;
  historyValues?: FieldOperator[];
  historyComments?: FieldOfficer[];
}

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ApplicationField({
  fv,
  field,
  isOfficerUnderReview,
  isResponding = false,
  isRecentlyCreated = false,
  comment,
  historyValues,
  historyComments,
}: ApplicationFieldProps) {
  const [selectedValueIndex, setSelectedValueIndex] = useState<number | null>(null);
  const [selectedCommentIndex, setSelectedCommentIndex] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ filename: string; dataUrl: string } | null>(null);

  const latestComment = comment?.field_id === fv.field_id ? comment : undefined;

  const renderValue = () => {
    if (field.type.value === 'file') {
      return <FileDownloadLink value={fv.value} />;
    }

    return (
      <div className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-800">
        {fv.value}
      </div>
    );
  };

  return (
    <div className={isRecentlyCreated ? 'border-2 border-orange-400 rounded-xl p-3' : ''}>
      <label className="block text-sm font-medium text-zinc-900 mb-1.5">
        {field.title}
      </label>

      {/* When Operator is responding to comments, show editable input for fields with unresolved comments */}
      {isResponding && latestComment ? (
        field.type.value === 'text' ? (
          <textarea
            name={`field-${fv.field_id}`}
            rows={3}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            defaultValue={fv.value}
            placeholder={`Update your response`}
          />
        ) : field.type.value === 'file' ? (
          <div className="flex items-center gap-3">
            <label className="relative cursor-pointer rounded-lg border border-zinc-300 bg-white transition-colors hover:bg-zinc-50">
              <input
                name={`field-${fv.field_id}`}
                type="file"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setSelectedFile({ filename: file.name, dataUrl: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 transition-colors max-w-xs">
                {selectedFile ? (
                  <>
                    <svg className="size-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="truncate">{selectedFile.filename}</span>
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
            {selectedFile && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                }}
                className="text-xs text-red-500 hover:text-red-600"
              >
                Remove
              </button>
            )}
          </div>
        ) : null
      ) : renderValue()}
      
      {/* Past Submissions History */}
      {historyValues && historyValues.length > (isResponding && latestComment ? 0 : 1) && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-zinc-500">View Past Submissions</h4>
            <span className="text-xs text-zinc-400">({historyValues.length} entries)</span>
          </div>
          <select
            value={selectedValueIndex ?? ''}
            onChange={e => setSelectedValueIndex(e.target.value ? Number(e.target.value) : null)}
            className="w-full sm:w-64 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
          >
            <option value="">Select a submission</option>
            {historyValues.map((entry, index) => (
              <option key={entry.id} value={index}>
                {formatDateTime(entry.created_at)}
              </option>
            ))}
          </select>
          {selectedValueIndex !== null && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-500">
                Past Submission ({formatDateTime(historyValues[selectedValueIndex].created_at)})
              </label>
              {field.type.value === 'file' ? <FileDownloadLink value={historyValues[selectedValueIndex].value} /> : (
                <div className="rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-800">
                  {historyValues[selectedValueIndex].value}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Officer comment */}
      {latestComment && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-zinc-500 mb-1">
            Officer Comment
          </label>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {latestComment.comment}
          </div>
        </div>
      )}

      {isOfficerUnderReview && (
        <div className="mt-3 space-y-2">
          <label className="block text-sm font-medium text-zinc-500 mb-1">
            Add Comments
          </label>
          <textarea
            form="resubmit-form"
            name={`comment-${fv.field_id}`}
            rows={3}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            placeholder="Add comments..."
          />
        </div>
      )}

      {/* Past Comments History */}
      {historyComments && historyComments.length > 1 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-zinc-500">View Past Comments</h4>
            <span className="text-xs text-zinc-400">({historyComments.length} entries)</span>
          </div>
          <select
            value={selectedCommentIndex ?? ''}
            onChange={e => setSelectedCommentIndex(e.target.value ? Number(e.target.value) : null)}
            className="w-full sm:w-64 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-white"
          >
            <option value="">Select a comment</option>
            {historyComments.map((entry, index) => (
              <option key={entry.id} value={index}>
                {formatDateTime(entry.created_at)}
              </option>
            ))}
          </select>
          {selectedCommentIndex !== null && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-500">
                Past Comment ({formatDateTime(historyComments[selectedCommentIndex].created_at)})
              </label>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {historyComments[selectedCommentIndex].comment}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

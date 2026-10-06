import { getApplication, updateStatus } from '@/app/actions';
import { getUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { StatusBadge } from '@/components/applications/status-badge';
import { Timeline } from '@/components/applications/timeline';
import { ApplicationField } from '@/components/applications/application-field';
import { ResubmitForm } from '@/components/applications/resubmit-form';
import { respondAndUpdateFields } from '@/app/(main)/applications/actions';
import { Button } from '@/components/ui/button';
import type { Field, FieldOperator, ApplicationStatus, Status, FieldOfficer } from '@/lib/db/schema';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const user = await getUser();

  const { id } = await params;
  const applicationId = parseInt(id, 10);

  const application = await getApplication(applicationId, user.id, user.role);
  if (!application) {
    redirect('/');
  }

  const form = await db.form.select();
  const fieldOrder = form.length > 0 ? JSON.parse(form[0].field_ids) : [];

  const fields = await db.field.select();
  const fieldTypes = await db.fieldType.select();

  const fieldsWithTypes = fields.map(field => ({
    ...field,
    type: fieldTypes.find(ft => ft.id === field.type_id)!,
  }));

  const getFieldById = (fieldId: number) => fieldsWithTypes.find(f => f.id === fieldId);

  // Fetch officer comments for this application
  const allOfficerComments = await db.fieldOfficer.select();
  const comments: FieldOfficer[] = allOfficerComments.filter(
    c => c.application_id === applicationId
  );

  // Latest comment per field (for display)
  const latestComments = new Map<number, FieldOfficer>();
  comments
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    .forEach(c => {
      if (!latestComments.has(c.field_id)) {
        latestComments.set(c.field_id, c);
      }
    });

  const currentStatus = application.statusHistory[application.statusHistory.length - 1]?.status;
  const isApplicationReceived = currentStatus?.internal === 'Application Received';
  const isPreSiteResubmitted = currentStatus?.internal === 'Pre-Site Resubmitted';
  const canStartReview = user.role === 'Officer' && (isApplicationReceived || isPreSiteResubmitted);
  const isOfficerUnderReview = user.role === 'Officer' && currentStatus?.internal === 'Under Review';
  const isPendingPresiteResubmission = currentStatus?.internal === 'Pending Pre-Site Resubmission';

  // Deduplicate fieldValues to latest per field_id
  const latestFieldValues: FieldOperator[] = [];
  const seenFields = new Set<number>();
  // Sort by created_at descending so first occurrence is the latest
  const sortedFieldValues = [...application.fieldValues].sort(
    (a, b) => b.created_at.getTime() - a.created_at.getTime()
  );
  for (const fv of sortedFieldValues) {
    if (!seenFields.has(fv.field_id)) {
      seenFields.add(fv.field_id);
      latestFieldValues.push(fv);
    }
  }
  latestFieldValues.sort((a, b) => fieldOrder.indexOf(a.field_id) - fieldOrder.indexOf(b.field_id));

  // Filter out comments that were made before or at the same time as the field value
  for (const fv of latestFieldValues) {
    const comment = latestComments.get(fv.field_id);
    if (comment && comment.created_at <= fv.created_at) {
      latestComments.delete(fv.field_id);
    }
  }

  // Find cutoff date: latest "Pre-Site Resubmitted" or fallback to "Application Received"
  const cutoffStatus = application.statusHistory
    .slice()
    .reverse()
    .find(s => s.status?.internal === 'Pre-Site Resubmitted')
    ?? application.statusHistory
    .slice()
    .reverse()
    .find(s => s.status?.internal === 'Application Received');

  // Group FieldOperator records by field_id for history
  const fieldOperatorHistory = new Map<number, FieldOperator[]>();
  for (const fv of application.fieldValues) {
    const list = fieldOperatorHistory.get(fv.field_id) || [];
    list.push(fv);
    fieldOperatorHistory.set(fv.field_id, list);
  }
  fieldOperatorHistory.forEach((list) =>
    list.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
  );

  // Group FieldOfficer comments by field_id for history
  const fieldOfficerHistory = new Map<number, FieldOfficer[]>();
  for (const co of comments) {
    const list = fieldOfficerHistory.get(co.field_id) || [];
    list.push(co);
    fieldOfficerHistory.set(co.field_id, list);
  }
  fieldOfficerHistory.forEach((list) =>
    list.sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <a
            href="/"
            className="mb-2 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Applications
          </a>
          <h1 className="text-2xl font-semibold text-zinc-900">
            License Application #{application.id}
          </h1>
        </div>
        {currentStatus && <StatusBadge status={user.role === 'Operator' ? currentStatus.operator : currentStatus.officer} />}
      </div>

      {/* Action button for officers */}
      {canStartReview && (
        <form action={updateStatus.bind(null, applicationId, user.id, user.role, 'Under Review')}>
          <Button type="submit" className="w-full sm:w-auto">
            Start Review
          </Button>
        </form>
      )}

      {/* Action buttons for officer under review */}
      {isOfficerUnderReview && (
        <div className="flex flex-col sm:flex-row gap-2">
          <ResubmitForm
            applicationId={applicationId}
            userId={user.id}
            userRole={user.role}
          />
          <form action={updateStatus.bind(null, applicationId, user.id, user.role, 'Site Visit Scheduled')}>
            <Button type="submit" className="w-full sm:w-auto">
              Site Visit Scheduled
            </Button>
          </form>
        </div>
      )}

      {/* Meta info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-zinc-500">Submitted by: </span>
          <span className="text-zinc-900 font-medium">{application.operator.name}</span>
        </div>
        <div>
          <span className="text-zinc-500">Assigned officer: </span>
          <span className="text-zinc-900 font-medium">
            {application.officer?.name ?? 'Unassigned'}
          </span>
        </div>
      </div>
      <p className="text-sm text-zinc-500">
        Submitted on {new Date(application.submittedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      {/* Form Answers */}
      <form
        action={respondAndUpdateFields.bind(null, applicationId, user.id)}
        className="space-y-4"
      >
        <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-5">
          <h2 className="text-lg font-medium text-zinc-900">Operator Responses</h2>
          <div className="space-y-14">
            {latestFieldValues.map(fv => {
              const field = getFieldById(fv.field_id);
              if (!field) return null;
              const isRecentlyCreated = isOfficerUnderReview && cutoffStatus
                ? fv.created_at.getTime() >= cutoffStatus.created_at.getTime() - 1000
                : false;
              return (
                <ApplicationField
                  key={fv.id}
                  fv={fv}
                  field={field as Field & { type: { value: string } }}
                  isOfficerUnderReview={isOfficerUnderReview}
                  isPendingPresiteResubmission={isPendingPresiteResubmission}
                  isRecentlyCreated={isRecentlyCreated}
                  comment={latestComments.get(fv.field_id)}
                  isResponding={user.role === 'Operator' && isPendingPresiteResubmission}
                  historyValues={fieldOperatorHistory.get(fv.field_id)}
                  historyComments={fieldOfficerHistory.get(fv.field_id)}
                />
              );
            })}
          </div>
        </div>
        {user.role === 'Operator' && isPendingPresiteResubmission && (
          <div className="flex justify-end">
            <Button type="submit" className="min-w-32">
              Submit Responses
            </Button>
          </div>
        )}
      </form>

      {/* Timeline */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4">
        <h2 className="text-lg font-medium text-zinc-900">Status History</h2>
        <Timeline items={application.statusHistory} userId={user.id} role={user.role} />
      </div>
    </div>
  );
}

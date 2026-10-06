'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

const OFFICER_BRENDA_ID = 2;

/* ── Status Transition Rules ─────────────────────────────────────
 * Maps target internal status → allowed source statuses + roles.
 * Extend this object as new transitions are needed.
 * ───────────────────────────────────────────────────────────────── */

const STATUS_TRANSITIONS: Record<
  string,
  { allowedSources: string[]; allowedRoles: ('Officer' | 'Operator')[] }
> = {
  'Under Review': {
    allowedSources: ['Application Received', 'Pre-Site Resubmitted'],
    allowedRoles: ['Officer'],
  },
  'Pending Pre-Site Resubmission': {
    allowedSources: ['Under Review'],
    allowedRoles: ['Officer'],
  },
  'Pre-Site Resubmitted': {
    allowedSources: ['Pending Pre-Site Resubmission'],
    allowedRoles: ['Operator'],
  },
  'Site Visit Scheduled': {
    allowedSources: ['Under Review'],
    allowedRoles: ['Officer'],
  },
};

/* ── Applications ──────────────────────────────────────────────── */

export async function getApplications(userId: number, userRole: 'Operator' | 'Officer') {
  const applications = await db.application.select();
  const statusHistory = await db.applicationStatus.select();
  const allStatuses = await db.status.select();
  const fieldValues = await db.fieldOperator.select();

  const filtered = applications.filter(a =>
    userRole === 'Operator'
      ? a.operator_id === userId
      : a.officer_id === userId
  );

  return filtered
    .map(app => {
      const appHistory = statusHistory
        .filter(s => s.application_id === app.id)
        .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
      const latestStatus = appHistory[0];
      const status = latestStatus
        ? allStatuses.find(s => s.id === latestStatus.status_id)
        : null;
      const values = fieldValues.filter(f => f.application_id === app.id);

      return {
        ...app,
        fieldValues: values,
        statusOperator: status?.operator,
        statusOfficer: status?.officer,
        created_at: latestStatus?.created_at || new Date(),
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getApplication(id: number, userId: number, userRole: 'Operator' | 'Officer') {
  const app = await db.application.selectById(id);
  if (!app) return null;

  // Authorization: only the assigned operator or officer can view
  const isOperator = userRole === 'Operator' && app.operator_id === userId;
  const isOfficer = userRole === 'Officer' && app.officer_id === userId;
  if (!isOperator && !isOfficer) return null;

  const statusHistory = await db.applicationStatus.select();
  const allStatuses = await db.status.select();
  const fieldValues = await db.fieldOperator.select();

  const appHistory = statusHistory
    .filter(s => s.application_id === id)
    .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

  const values = fieldValues.filter(f => f.application_id === id);

  const statusWithLabels = appHistory.map(s => {
    const status = allStatuses.find(st => st.id === s.status_id);
    return {
      ...s,
      status,
    };
  });

  const officer = app.officer_id ? await db.user.selectById(app.officer_id) : null;
  const operator = await db.user.selectById(app.operator_id);
  if (!operator) throw new Error('Operator not found');

  return {
    ...app,
    fieldValues: values,
    statusHistory: statusWithLabels,
    submittedAt: appHistory[0]?.created_at || new Date(),
    operator: { id: operator.id, name: operator.name },
    officer: officer ? { id: officer.id, name: officer.name } : null,
  };
}

export async function updateStatus(
  applicationId: number,
  userId: number,
  userRole: 'Operator' | 'Officer',
  newStatusInternal: string,
) {
  const app = await db.application.selectById(applicationId);
  if (!app) return;

  // Authorization: user must be the assigned operator or officer
  const isAuthorized =
    (userRole === 'Operator' && app.operator_id === userId) ||
    (userRole === 'Officer' && app.officer_id === userId);
  if (!isAuthorized) return;

  // Validate transition rules exist for target status
  const rules = STATUS_TRANSITIONS[newStatusInternal];
  if (!rules) return;

  // Validate user role is allowed
  if (!rules.allowedRoles.includes(userRole)) return;

  // Get current internal status
  const allStatuses = await db.status.select();
  const statusHistory = await db.applicationStatus.select();
  const appHistory = statusHistory
    .filter(s => s.application_id === applicationId)
    .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

  const latestStatusEntry = appHistory[appHistory.length - 1];
  if (!latestStatusEntry) return;

  const currentStatus = allStatuses.find(s => s.id === latestStatusEntry.status_id);
  if (!currentStatus) return;

  // Validate current status is an allowed source
  if (!rules.allowedSources.includes(currentStatus.internal)) return;

  // Find target status_id and apply
  const targetStatus = allStatuses.find(s => s.internal === newStatusInternal);
  if (!targetStatus) return;

  await db.applicationStatus.insert({
    application_id: applicationId,
    status_id: targetStatus.id,
    created_by: userId,
    created_at: new Date(),
  });

  revalidatePath(`/applications/${applicationId}`);
}

/* ── Request Resubmit ────────────────────────────────────────── */

export async function requestResubmit(
  applicationId: number,
  userId: number,
  userRole: 'Operator' | 'Officer',
  comments: { field_id: number; comment: string }[],
) {
  const app = await db.application.selectById(applicationId);
  if (!app) return { error: 'Application not found' };

  // Authorization
  const isAuthorized =
    (userRole === 'Operator' && app.operator_id === userId) ||
    (userRole === 'Officer' && app.officer_id === userId);
  if (!isAuthorized) return { error: 'Unauthorized' };

  // Validate at least one comment is non-empty
  const nonEmptyComments = comments.filter(c => c.comment.trim().length > 0);
  if (nonEmptyComments.length === 0) {
    return { error: 'At least one comment must be filled.' };
  }

  // Validate transition rules
  const rules = STATUS_TRANSITIONS['Pending Pre-Site Resubmission'];
  if (!rules || !rules.allowedRoles.includes(userRole)) return { error: 'Invalid transition' };

  // Get current status
  const allStatuses = await db.status.select();
  const statusHistory = await db.applicationStatus.select();
  const appHistory = statusHistory
    .filter(s => s.application_id === applicationId)
    .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

  const latestStatusEntry = appHistory[appHistory.length - 1];
  if (!latestStatusEntry) return { error: 'Status not found' };

  const currentStatus = allStatuses.find(s => s.id === latestStatusEntry.status_id);
  if (!currentStatus || !rules.allowedSources.includes(currentStatus.internal)) {
    return { error: 'Invalid current status' };
  }

  // Insert all non-empty comments as FieldOfficer records
  for (const c of nonEmptyComments) {
    await db.fieldOfficer.insert({
      field_id: c.field_id,
      application_id: applicationId,
      comment: c.comment.trim(),
      created_at: new Date(),
    });
  }

  // Update status
  const targetStatus = allStatuses.find(s => s.internal === 'Pending Pre-Site Resubmission');
  if (!targetStatus) return { error: 'Target status not found' };

  await db.applicationStatus.insert({
    application_id: applicationId,
    status_id: targetStatus.id,
    created_by: userId,
    created_at: new Date(),
  });

  revalidatePath(`/applications/${applicationId}`);
  return { success: true };
}

/* ── Respond to Comments ──────────────────────────────────────── */

export async function respondToApplication(
  applicationId: number,
  userId: number,
  updates: { field_id: number; value: string }[],
) {
  const app = await db.application.selectById(applicationId);
  if (!app) return { error: 'Application not found' };

  // Authorization: user must be the assigned operator
  if (app.operator_id !== userId) return { error: 'Unauthorized' };

  // Validate status is Pending Pre-Site Resubmission
  const allStatuses = await db.status.select();
  const statusHistory = await db.applicationStatus.select();
  const appHistory = statusHistory
    .filter(s => s.application_id === applicationId)
    .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

  const latestStatusEntry = appHistory[appHistory.length - 1];
  if (!latestStatusEntry) return { error: 'Status not found' };

  const currentStatus = allStatuses.find(s => s.id === latestStatusEntry.status_id);
  if (!currentStatus || currentStatus.internal !== 'Pending Pre-Site Resubmission') {
    return { error: 'Application is not in the expected status' };
  }

  // Insert new FieldOperator records for each updated field
  for (const update of updates) {
    await db.fieldOperator.insert({
      field_id: update.field_id,
      application_id: applicationId,
      value: update.value,
      created_at: new Date(),
    });
  }

  // Transition status to Pre-Site Resubmitted
  const targetStatus = allStatuses.find(s => s.internal === 'Pre-Site Resubmitted');
  if (!targetStatus) return { error: 'Target status not found' };

  await db.applicationStatus.insert({
    application_id: applicationId,
    status_id: targetStatus.id,
    created_by: userId,
    created_at: new Date(),
  });

  revalidatePath(`/applications/${applicationId}`);
  return { success: true };
}

async function fileToValue(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString('base64');
  const mimeType = file.type || 'application/octet-stream';
  return JSON.stringify({ filename: file.name, dataUrl: `data:${mimeType};base64,${base64}` });
}

export async function respondAndUpdateFields(
  applicationId: number,
  userId: number,
  formData: FormData,
) {
  const fieldValues: { field_id: number; value: string }[] = [];
  for (const key of formData.keys()) {
    if (key.startsWith('field-')) {
      const fieldId = parseInt(key.replace('field-', ''), 10);
      const value = formData.get(key);
      if (typeof value === 'string') {
        fieldValues.push({ field_id: fieldId, value });
      } else if (value instanceof File && value.size > 0) {
        const fileValue = await fileToValue(value);
        fieldValues.push({ field_id: fieldId, value: fileValue });
      }
    }
  }
  if (fieldValues.length > 0) {
    await respondToApplication(applicationId, userId, fieldValues);
  }
}

export async function createApplication(
  operatorId: number,
  fieldValues: { field_id: number; value: string }[],
) {
  const form = await db.form.selectById(1);
  if (!form) return null;

  const application = await db.application.insert({
    form_id: form.id,
    operator_id: operatorId,
    officer_id: OFFICER_BRENDA_ID,
  });

  // Insert field values
  for (const fv of fieldValues) {
    await db.fieldOperator.insert({
      field_id: fv.field_id,
      application_id: application.id,
      value: fv.value,
      created_at: new Date(),
    });
  }

  // Set initial status (Submitted = status_id 1)
  await db.applicationStatus.insert({
    application_id: application.id,
    status_id: 1,
    created_by: operatorId,
    created_at: new Date(),
  });

  return application;
}

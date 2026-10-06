import { userStore, fieldTypeStore, fieldStore, statusStore, formStore } from './index';

export function seed() {
  userStore.insert({ name: 'Adam', role: 'Operator' });
  userStore.insert({ name: 'Brenda', role: 'Officer' });

  fieldTypeStore.insert({ value: 'text' });
  fieldTypeStore.insert({ value: 'file' });

  fieldStore.insert({ type_id: 1, title: 'Name of Business' });
  fieldStore.insert({ type_id: 1, title: 'Purpose of Business' });
  fieldStore.insert({ type_id: 1, title: 'Site Address' });
  fieldStore.insert({ type_id: 2, title: 'Business Supporting Document' });
  fieldStore.insert({ type_id: 2, title: 'Site Supporting Document' });

  statusStore.insert({ internal: 'Application Received', officer: 'Application Received', operator: 'Submitted' });
  statusStore.insert({ internal: 'Under Review', officer: 'Under Review', operator: 'Under Review' });
  statusStore.insert({ internal: 'Pending Pre-Site Resubmission', officer: 'Pending Pre-Site Resubmission', operator: 'Pending Pre-Site Resubmission' });
  statusStore.insert({ internal: 'Pre-Site Resubmitted', officer: 'Pre-Site Resubmitted', operator: 'Pre-Site Resubmitted' });
  statusStore.insert({ internal: 'Site Visit Scheduled', officer: 'Site Visit Scheduled', operator: 'Pending Site Visit' });
  statusStore.insert({ internal: 'Site Visit Done', officer: 'Site Visit Done', operator: 'Pending Post-Site Clarification' });
  statusStore.insert({ internal: 'Awaiting Post-Site Clarification', officer: 'Awaiting Post-Site Clarification', operator: 'Pending Post-Site Clarification' });
  statusStore.insert({ internal: 'Pending Post-Site Resubmission', officer: 'Awaiting Post-Site Resubmission', operator: 'Pending Post-Site Resubmission' });
  statusStore.insert({ internal: 'Post-Site Clarification Resubmitted', officer: 'Post-Site Clarification Resubmitted', operator: 'Post-Site Resubmitted' });
  statusStore.insert({ internal: 'Pending Approval', officer: 'Route to Approval', operator: 'Pending Approval' });
  statusStore.insert({ internal: 'Approved', officer: 'Approved', operator: 'Approved' });
  statusStore.insert({ internal: 'Rejected', officer: 'Rejected', operator: 'Rejected' });

  formStore.insert({ field_ids: JSON.stringify([1, 2, 3, 4, 5]) });
}

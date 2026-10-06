import { z } from 'zod';

/* ── Auth ──────────────────────────────────────────────────────── */

export const UserSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
  role: z.enum(['Operator', 'Officer']),
});

export type User = z.infer<typeof UserSchema>;

/* ── Lookup Tables ─────────────────────────────────────────────── */

export const FieldTypeSchema = z.object({
  id: z.number(),
  value: z.string().min(1),
});

export const FieldSchema = z.object({
  id: z.number(),
  type_id: z.number(),
  title: z.string().min(1).max(255),
});

export const StatusSchema = z.object({
  id: z.number(),
  internal: z.string().min(1),
  officer: z.string().min(1),
  operator: z.string().min(1),
});

/* ── Core Tables ───────────────────────────────────────────────── */

export const FormSchema = z.object({
  id: z.number(),
  field_ids: z.string(), // JSON array of field IDs
});

export const ApplicationSchema = z.object({
  id: z.number(),
  form_id: z.number(),
  operator_id: z.number(),
  officer_id: z.number().nullable(),
});

/* ── Junction / History Tables ─────────────────────────────────── */

export const FieldOperatorSchema = z.object({
  id: z.number(),
  field_id: z.number(),
  application_id: z.number(),
  value: z.string(),
  created_at: z.date(),
});

export const FieldOfficerSchema = z.object({
  id: z.number(),
  field_id: z.number(),
  application_id: z.number(),
  comment: z.string(),
  created_at: z.date(),
});

export const ApplicationStatusSchema = z.object({
  id: z.number(),
  application_id: z.number(),
  status_id: z.number(),
  created_by: z.number(),
  created_at: z.date(),
});

/* ── Inferred Types ────────────────────────────────────────────── */

export type FieldType = z.infer<typeof FieldTypeSchema>;
export type Field = z.infer<typeof FieldSchema>;
export type Status = z.infer<typeof StatusSchema>;
export type Form = z.infer<typeof FormSchema>;
export type Application = z.infer<typeof ApplicationSchema>;
export type FieldOperator = z.infer<typeof FieldOperatorSchema>;
export type FieldOfficer = z.infer<typeof FieldOfficerSchema>;
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

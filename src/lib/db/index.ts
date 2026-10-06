import {
  UserSchema,
  FieldTypeSchema,
  FieldSchema,
  StatusSchema,
  FormSchema,
  ApplicationSchema,
  FieldOperatorSchema,
  FieldOfficerSchema,
  ApplicationStatusSchema,
} from './schema';
import { InMemoryStore } from './store';
import type {
  User,
  FieldType,
  Field,
  Status,
  Form,
  Application,
  FieldOperator,
  FieldOfficer,
  ApplicationStatus,
} from './schema';

/* ── Stores ────────────────────────────────────────────────────── */

const userStore = new InMemoryStore<User>(UserSchema);

const fieldTypeStore = new InMemoryStore<FieldType>(FieldTypeSchema);
const fieldStore = new InMemoryStore<Field>(FieldSchema);
const statusStore = new InMemoryStore<Status>(StatusSchema);
const formStore = new InMemoryStore<Form>(FormSchema);
const applicationStore = new InMemoryStore<Application>(ApplicationSchema);
const fieldOperatorStore = new InMemoryStore<FieldOperator>(FieldOperatorSchema);
const fieldOfficerStore = new InMemoryStore<FieldOfficer>(FieldOfficerSchema);
const applicationStatusStore = new InMemoryStore<ApplicationStatus>(ApplicationStatusSchema);

/* ── Exports (for seeding & testing) ───────────────────────────── */

export { userStore, fieldTypeStore, fieldStore, statusStore, formStore, applicationStore, fieldOperatorStore, fieldOfficerStore, applicationStatusStore };

/* ── Database Client ───────────────────────────────────────────── */

export const db = {
  /* Auth */
  user: {
    select: () => userStore.select(),
    selectById: (id: number) => userStore.selectById(id),
    insert: (record: Omit<User, 'id'>) => userStore.insert(record),
  },

  /* Lookup tables */
  fieldType: {
    select: () => fieldTypeStore.select(),
    selectById: (id: number) => fieldTypeStore.selectById(id),
    insert: (record: Omit<FieldType, 'id'>) => fieldTypeStore.insert(record),
  },

  field: {
    select: () => fieldStore.select(),
    selectById: (id: number) => fieldStore.selectById(id),
    insert: (record: Omit<Field, 'id'>) => fieldStore.insert(record),
  },

  status: {
    select: () => statusStore.select(),
    selectById: (id: number) => statusStore.selectById(id),
    insert: (record: Omit<Status, 'id'>) => statusStore.insert(record),
  },

  /* Core tables */
  form: {
    select: () => formStore.select(),
    selectById: (id: number) => formStore.selectById(id),
    insert: (record: Omit<Form, 'id'>) => formStore.insert(record),
  },

  application: {
    select: () => applicationStore.select(),
    selectById: (id: number) => applicationStore.selectById(id),
    insert: (record: Omit<Application, 'id'>) => applicationStore.insert(record),
  },

  /* Junction / history tables */
  fieldOperator: {
    select: () => fieldOperatorStore.select(),
    selectById: (id: number) => fieldOperatorStore.selectById(id),
    insert: (record: Omit<FieldOperator, 'id'>) => fieldOperatorStore.insert(record),
  },

  fieldOfficer: {
    select: () => fieldOfficerStore.select(),
    selectById: (id: number) => fieldOfficerStore.selectById(id),
    insert: (record: Omit<FieldOfficer, 'id'>) => fieldOfficerStore.insert(record),
  },

  applicationStatus: {
    select: () => applicationStatusStore.select(),
    selectById: (id: number) => applicationStatusStore.selectById(id),
    insert: (record: Omit<ApplicationStatus, 'id'>) => applicationStatusStore.insert(record),
  },
};

import { seed } from './seed';
seed();

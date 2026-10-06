import { getUser } from '@/lib/session';
import { db } from '@/lib/db';
import { ApplicationForm } from '@/components/applications/application-form';

export default async function NewApplicationPage() {
  const user = await getUser();

  const fields = await db.field.select();
  const fieldTypes = await db.fieldType.select();

  // Join fields with their types
  const fieldsWithTypes = fields.map(field => ({
    ...field,
    type: fieldTypes.find(ft => ft.id === field.type_id)!,
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900">
          New License Application
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Fill in all fields to submit your application for review.
        </p>
      </div>

      <ApplicationForm fields={fieldsWithTypes} operatorId={user.id} />
    </div>
  );
}

import { z } from 'zod';

/**
 * Generic in-memory store with auto-incrementing integer IDs.
 */
export class InMemoryStore<T extends { id: number }> {
  private data: Map<number, T> = new Map();
  private nextId = 1;

  constructor(private schema?: z.ZodType<T>) {}

  async select(): Promise<T[]> {
    return Array.from(this.data.values());
  }

  async selectById(id: number): Promise<T | null> {
    return this.data.get(id) ?? null;
  }

  async insert(record: Omit<T, 'id'>): Promise<T> {
    const withId: T = {
      ...record,
      id: this.nextId++,
    } as T;

    // Validate if schema provided
    const validated = this.schema ? this.schema.parse(withId) : withId;
    this.data.set(validated.id, validated);
    return validated;
  }

  async delete(id: number): Promise<boolean> {
    return this.data.delete(id);
  }
}

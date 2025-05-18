import { Kysely } from 'kysely';
import databaseSchema from '../schemas.js';
import { sql } from 'kysely';

export const up = async (database: Kysely<databaseSchema>) => {
  return database.schema
    .createTable('notifications')
    .ifNotExists()
    .addColumn('NotificationId', 'uuid', (col) =>
      col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn('userId', 'uuid', (col) => col.notNull())
    .addColumn('content', 'jsonb', (col) => col.notNull())
    .addColumn('read', 'boolean', (col) => col.defaultTo(false))
    .execute();
};

export const down = async (database: Kysely<databaseSchema>) => {
  return database.schema.dropTable('notifications').ifExists().execute();
};

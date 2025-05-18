import { Kysely } from 'kysely';
import databaseSchema from '../schemas.js';
import { sql } from 'kysely';

export const up = async (database: Kysely<databaseSchema>) => {
  return database.schema
    .createTable('comments')
    .ifNotExists()
    .addColumn('commentId', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('authorId', 'uuid', (col) => col.notNull())
    .addColumn('postId', 'uuid', (col) => col.notNull())
    .addColumn('content', 'jsonb', (col) => col.notNull())
    .execute();
};

export const down = async (database: Kysely<databaseSchema>) => {
  return database.schema.dropTable('comments').ifExists().execute();
};

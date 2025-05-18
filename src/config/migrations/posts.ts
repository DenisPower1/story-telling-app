import { Kysely } from 'kysely';
import databaseSchema from '../schemas.js';
import { sql } from 'kysely';

export const up = async (database: Kysely<databaseSchema>) => {
  return database.schema
    .createTable('posts')
    .ifNotExists()
    .addColumn('postId', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('authorId', 'uuid', (col) => col.notNull())
    .addColumn('content', 'jsonb', (col) => col.notNull())
    .addColumn('likesNumber', 'integer', (col) => col.defaultTo(0))
    .addColumn('commentsNumber', 'integer', (col) => col.defaultTo(0))
    .addColumn('likedByUser', 'boolean', (col) => col.defaultTo(false))
    .execute();
};

export const down = async (database: Kysely<databaseSchema>) => {
  return database.schema.dropTable('posts').ifExists().execute();
};

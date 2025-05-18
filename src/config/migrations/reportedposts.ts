import { Kysely } from 'kysely';
import databaseSchema from '../schemas.js';

export const up = async (database: Kysely<databaseSchema>) => {
  return database.schema
    .createTable('reportedPosts')
    .ifNotExists()
    .addColumn('reporterId', 'uuid', (col) => col.notNull())
    .addColumn('postId', 'uuid', (col) => col.notNull().unique())
    .execute();
};

export const down = async (database: Kysely<databaseSchema>) => {
  return database.schema.dropTable('reportedPosts').ifExists().execute();
};

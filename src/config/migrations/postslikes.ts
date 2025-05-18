import { Kysely } from 'kysely';
import databaseSchema from '../schemas.js';

export const up = async (database: Kysely<databaseSchema>) => {
  return database.schema
    .createTable('postsLikes')
    .ifNotExists()
    .addColumn('postId', 'uuid', (col) => col.notNull())
    .addColumn('likerId', 'uuid', (col) => col.notNull())
    .execute();
};

export const down = async (database: Kysely<databaseSchema>) => {
  return database.schema.dropTable('postslikes').ifExists().execute();
};

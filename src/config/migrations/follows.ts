import { Kysely } from 'kysely';
import databaseSchema from '../schemas.js';

export const up = async (database: Kysely<databaseSchema>) => {
  return database.schema
    .createTable('follows')
    .ifNotExists()
    .addColumn('followerId', 'uuid', (col) => col.notNull())
    .addColumn('followeeId', 'uuid', (col) => col.notNull())
    .execute();
};

export const down = async (database: Kysely<databaseSchema>) => {
  return database.schema.dropTable('follows').ifExists().execute();
};

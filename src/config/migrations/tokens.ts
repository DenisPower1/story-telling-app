import { Kysely } from 'kysely';
import databaseSchema from '../schemas.js';

export const up = async (database: Kysely<databaseSchema>) => {
  return database.schema
    .createTable('tokens')
    .ifNotExists()
    .addColumn('token', 'varchar(200)', (col) => col.notNull().unique())
    .execute();
};

export const down = async (database: Kysely<databaseSchema>) => {
  return database.schema.dropTable('tokens').ifExists().execute();
};

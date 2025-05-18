import { sql } from 'kysely';
import databaseSchema from '../schemas.js';
import { Kysely } from 'kysely';

export const up = async (database: Kysely<databaseSchema>) => {
  return database.schema
    .createTable('users')
    .ifNotExists()
    .addColumn('id', 'uuid', (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn('email', 'varchar(255)', (col) => col.unique())
    .addColumn('password', 'varchar(255)', (col) => col.notNull())
    .addColumn('name', 'jsonb', (col) => col.notNull())
    .addColumn('country', 'varchar(20)', (col) => col.notNull())
    .addColumn('birthDate', 'jsonb', (col) => col.notNull())
    .addColumn('gender', 'varchar(6)', (col) => col.notNull())
    .addColumn('topWriter', 'boolean', (col) => col.defaultTo(false))
    .addColumn('isOnline', 'boolean', (col) => col.defaultTo(false))
    .addColumn('profileViews', 'integer', (col) => col.defaultTo(0))
    .execute();
};

export const down = async (database: Kysely<databaseSchema>) => {
  return database.schema.dropTable('users').ifExists().execute();
};

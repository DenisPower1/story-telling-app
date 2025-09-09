import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import dataBaseSchema from './schemas.js';
import dotenv from 'dotenv';
import { up as createUsersTable } from './migrations/user.js';
import { up as createPostsTable } from './migrations/posts.js';
import { up as createCommentsTable } from './migrations/comments.js';
import { up as createNotificationsTable } from './migrations/notifications.js';
import { up as createReportedPostsTable } from './migrations/reportedposts.js';
import { up as createPostsLikesTable } from './migrations/postslikes.js';
import { up as createFollowsTable } from './migrations/follows.js';
import { up as createTokensTable } from './migrations/tokens.js';

dotenv.config();

const connectionString = process.env.databaseConnectionString;

const database = new Kysely<dataBaseSchema>({
  dialect: new PostgresDialect({
    pool: new Pool({
      connectionString: connectionString,
    }),
  }),
});

Promise.all([
  createUsersTable(database),
  createPostsTable(database),
  createCommentsTable(database),
  createNotificationsTable(database),
  createReportedPostsTable(database),
  createPostsLikesTable(database),
  createFollowsTable(database),
  createTokensTable(database),
]);

export default database;

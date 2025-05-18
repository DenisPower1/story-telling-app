import { sql } from 'kysely';
import database from '../config/db.js';
import type { userSchema as userInterface } from '../config/schemas.js';
import { createToken } from '../utils/token.js';
import { isSamePassWord } from '../utils/password.js';

export const registerUser = async (user: userInterface) => {
  const { name, email, password, gender, country, birthDate } = user;

  const userTable = database.selectFrom('users');
  const givenUserByEmail = await userTable
    .where('email', '=', email)
    .selectAll()
    .executeTakeFirst();

  if (givenUserByEmail) {
    return {
      success: false,
      message: 'The given e-mail is not available for registration.',
    };
  }

  const insertedUser = database.insertInto('users').values({
    name: name,
    email: email,
    password: password,
    gender: gender,
    country: country,
    birthDate: birthDate,
    topWriter: false,
    isOnline: false,
    profileViews: 0,
  });

  await insertedUser.execute();

  return {
    success: true,
    message: 'User registered succefully!',
  };
};

export const logUser = async (user: { email: string; password: string }) => {
  const userTable = database.selectFrom('users');
  const givenUser = await userTable
    .where('email', '=', user.email)
    .select('password')
    .executeTakeFirst();

  if (givenUser) {
    const samePassWord = isSamePassWord(user.password, givenUser.password);

    if (samePassWord) {
      const loggedUser = await userTable
        .where('email', '=', user.email)
        .where('password', '=', givenUser.password)
        .select(['id', 'name', 'email', 'profileViews'])
        .executeTakeFirst();
      const tokenPayLoad = {
        name: loggedUser.name,
        userId: loggedUser.id,
        email: loggedUser.email,
      };
      return {
        success: true,
        data: loggedUser,
        token: createToken(tokenPayLoad),
      };
    }
    return {
      success: true,
      message: 'Invalid credentials, check your password.',
    };
  } else {
    return {
      success: false,
      message: 'The user with the given e-mail was not found, create a new account.',
    };
  }
};

export const searchUser = async (searchTerm: string) => {
  const usersTable = database.selectFrom('users');
  const search = (term: string) => {
    /**
     * Don't worry about SQL Injection
     * KySely will sanitize the interpolated value.
     *
     */

    return sql<boolean>`
          to_tsvector('english', ${sql.ref('name')}->>'first' 
          || '' || ${sql.ref('name')}->>'last')  @@ 
          to_tsquery('english', ${term})
        `;
  };
  const foundPostWithGivenCriteria = await usersTable
    .where(search(searchTerm))
    .select(['name', 'id', 'topWriter'])
    .execute();

  return {
    success: true,
    data: foundPostWithGivenCriteria,
  };
};

export const deleteUser = async (userId: string) => {
  const deletefromUserTable = database.deleteFrom('users').where('id', '=', userId);
  const deleteFromNotificationTable = database
    .deleteFrom('notifications')
    .where('userId', '=', userId);
  const deleteFromFollowsTable = database
    .deleteFrom('follows')
    .where('followerId', '=', userId)
    .where('followeeId', '=', userId);

  const deleteFromCommentsTable = database.deleteFrom('comments').where('authorId', '=', userId);
  const deleteFromPostTable = database.deleteFrom('posts').where('authorId', '=', userId);

  Promise.all([
    deletefromUserTable.execute(),
    deleteFromNotificationTable.execute(),
    deleteFromFollowsTable.execute(),
    deleteFromCommentsTable.execute(),
    deleteFromPostTable.execute(),
  ]);

  return {
    success: true,
    message: 'The user was deleted successfully from our system, you can register again any time.',
  };
};

export const getAllFollowers = async (userId: string) => {
  const followsTable = database.selectFrom('follows');
  const followers = await followsTable
    .where('followeeId', '=', userId)
    .innerJoin('users', 'users.id', 'follows.followerId')
    .select(['users.name', 'users.id', 'users.isOnline'])
    .execute();

  return {
    success: true,
    data: followers,
  };
};

export const getAllFollowees = async (userId: string) => {
  const followsTable = database.selectFrom('follows');
  const followees = await followsTable
    .where('followerId', '=', userId)
    .innerJoin('users', 'users.id', 'follows.followeeId')
    .select(['users.name', 'users.id', 'users.isOnline'])
    .execute();

  return {
    success: true,
    data: followees,
  };
};

export const followAUser = async (followeeId: string, followerId: string) => {
  const insertFollowsTable = database.insertInto('follows');
  const followsTable = database.selectFrom('follows');
  const insertNotificationTable = database.insertInto('notifications');
  const alreadyFollowing = await followsTable
    .where('followeeId', '=', followeeId)
    .where('followerId', '=', followerId)
    .selectAll()
    .executeTakeFirst();
  const followInsertion = insertFollowsTable.values([
    { followeeId: followeeId, followerId: followerId },
  ]);
  const notificationInsertion = insertNotificationTable.values([
    { read: false, userId: followeeId, content: { text: 'Someone followed you.' } },
  ]);

  if (alreadyFollowing) {
    return {
      success: false,
      message: "You're already following this user.",
    };
  }

  Promise.all([followInsertion.execute(), notificationInsertion.execute()]);

  return {
    success: false,
    message: `You're now following this user.`,
  };
};

export const unfollowAUser = async (followeeId: string, followerId: string) => {
  const followsDeleteTable = database.deleteFrom('follows');
  await followsDeleteTable
    .where('followerId', '=', followerId)
    .where('followeeId', '=', followeeId)
    .execute();

  return {
    success: false,
    message: "You're no longer following this user.",
  };
};

export const followingThisUser = async (followerId: string, followeeId: string) => {
  const followsTable = database.selectFrom('follows');
  const following = followsTable
    .where('followerId', '=', followerId)
    .where('followeeId', '=', followeeId)
    .selectAll()
    .executeTakeFirst();

  return following ? true : false;
};

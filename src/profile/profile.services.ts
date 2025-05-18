import database from '../config/db.js';
import { isSamePassWord, encryptPassWord } from '../utils/password.js';

export const updatePassWord = async (passwordConfig: {
  oldPassWord: string;
  newPassWord: string;
  userId: string;
}) => {
  const userTable = database.selectFrom('users');
  const updateUserTable = database.updateTable('users');
  const loggedUser = await userTable
    .where('id', '=', passwordConfig.newPassWord)
    .select('password')
    .executeTakeFirst();
  const samePassWord = await isSamePassWord(passwordConfig.oldPassWord, loggedUser.password);

  if (samePassWord) {
    const encryptedPassword = await encryptPassWord(passwordConfig.newPassWord);
    await updateUserTable
      .where('id', '=', passwordConfig.userId)
      .set('password', encryptedPassword)
      .execute();

    return {
      success: true,
      message: 'Your password was updated Successfully!',
    };
  } else {
    return {
      success: false,
      code: 401,
      message: 'The password you provided does not match with your current password.',
    };
  }
};

export const updateUserMame = async (userId: string, newName: { first: string; last: string }) => {
  const userTable = database.selectFrom('users');
  const updateUserTable = database.updateTable('users');
  const givenUser = userTable.where('id', '=', userId).selectAll().executeTakeFirst();

  if (givenUser) {
    await updateUserTable
      .where('id', '=', userId)
      .set({
        name: newName,
      })
      .execute();

    return {
      success: true,
      message: `Your new name is ${newName.first} ${newName.last}`,
    };
  }
};

export const viewProfile = async (targetUserId: string, viewerId?: string) => {
  const userTable = database.selectFrom('users');
  const updateUserTable = database.updateTable('users');
  const notificationTable = database.insertInto('notifications');
  const viewer = await userTable.where('id', '=', viewerId).select('name').executeTakeFirst();
  const targetUser = await userTable
    .where('id', '=', targetUserId)
    .select(['name', 'birthDate', 'country', 'isOnline', 'topWriter', 'profileViews', 'id'])
    .executeTakeFirst();
  const profileViews = targetUser.profileViews++;
  const updateUserNotifications = notificationTable
    .values({
      userId: targetUserId,
      content: {
        text: `${viewer.name.first} visited your profile.`,
      },
    })
    .execute();
  const updateUserProfileViews = updateUserTable
    .where('id', '=', targetUserId)
    .set('profileViews', profileViews)
    .execute();
  Promise.all([updateUserNotifications, updateUserProfileViews]);
  return {
    success: true,
    data: targetUser,
  };
};

export const userViewOwnProfile = async (userId: string) => {
  const userTable = database.selectFrom('users');
  const targetUser = await userTable
    .where('id', '=', userId)
    .select(['name', 'birthDate', 'country', 'isOnline', 'topWriter', 'profileViews', 'id'])
    .executeTakeFirst();

  return {
    success: false,
    data: targetUser,
  };
};

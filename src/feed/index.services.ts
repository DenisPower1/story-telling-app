import { sql } from 'kysely';
import database from '../config/db.js';
import { commentSchema } from '../config/schemas.js';

export const getPostFromFollowings = async (userId: string) => {
  const followsTable = database.selectFrom('follows');
  const postsTable = database.selectFrom('posts');
  const usersFollowees = await followsTable
    .where('followerId', '=', userId)
    .select('followeeId')
    .execute();
  const posts = usersFollowees.map(async (item) => {
    return await postsTable
      .where('authorId', '=', item.followeeId)
      .orderBy(sql`RANDOM()`)
      .selectAll()
      .limit(5)
      .execute();
  });

  return posts;
};

export const postStory = async (post: {
  authorId: string;
  content: { title: string; text: string; attachments: string[] };
}) => {
  const usersTable = database.selectFrom('users');
  const insertPostsTable = database.insertInto('posts');
  const usersWithGivenId = await usersTable
    .where('id', '=', post.authorId)
    .selectAll()
    .executeTakeFirst();

  if (usersWithGivenId) {
    const postModel = {
      authorId: post.authorId,
      content: post.content,
      likesNumber: 0,
      commentsNumber: 0,
    };

    await insertPostsTable.values(postModel).execute();

    return {
      success: true,
      message: 'Post added successufly, manage your post in post panel.',
    };
  }
};

export const postComment = async (comment: commentSchema) => {
  const commentsTable = database.insertInto('comments');
  const postsTable = database.selectFrom('posts');
  const givenPost = await postsTable.where('postId', '=', '').selectAll().executeTakeFirst();

  if (givenPost) {
    const commentModel = {
      authorId: comment.authorId,
      postId: comment.postId,
      content: comment.content,
    };
    await commentsTable.values(commentModel).execute();
    return {
      success: true,
      message: 'Comment added successfully!',
    };
  } else {
    return {
      success: false,
      message: 'Something went wrong',
    };
  }
};

export const userDeletePost = async (postId: string, userId: string) => {
  const postsTable = database.selectFrom('posts');
  const deletePosts = database.deleteFrom('posts');
  const givenPost = await postsTable
    .where('postId', '=', postId)
    .select('authorId')
    .executeTakeFirst();

  if (givenPost.authorId == userId) {
    await deletePosts.where('postId', '=', postId).execute();
    return {
      success: true,
      message: 'Your post was deleted successfully!',
    };
  } else
    return {
      success: false,
      code: 403,
      message: 'You can not delete this post, it does not belong to you!',
    };
};

export const getAllUserPosts = async (userId: string) => {
  const postsTable = database.selectFrom('posts');
  const usersTable = database.selectFrom('users');
  const givenUser = await usersTable.where('id', '=', userId).selectAll().executeTakeFirst();

  if (givenUser) {
    const posts = await postsTable.where('authorId', '=', userId).selectAll().execute();

    return {
      success: true,
      posts: posts,
    };
  } else
    return {
      success: false,
      message: 'User was not found',
    };
};

export const getSuggestedAuthors = async (userId: string) => {
  const usersTable = database.selectFrom('users');
  const loggedUser = await usersTable.where('id', '=', userId).select('country').executeTakeFirst();
  const randomAuthorsInTheSameCountry = await usersTable
    .where('country', '=', loggedUser.country)
    .select(['name', 'id'])
    .limit(50)
    .orderBy(sql`RANDOM()`)
    .execute();
  return {
    success: true,
    data: randomAuthorsInTheSameCountry,
  };
};

export const getAllNotificationsFromUser = async (userId: string) => {
  const notificationsTable = database.selectFrom('notifications');
  const allNotifications = await notificationsTable
    .where('userId', '=', userId)
    .selectAll()
    .execute();
  const unreadNotications = allNotifications.filter((notification) => {
    if (!notification.read) return notification;
  });

  return {
    success: true,
    data: {
      unread: unreadNotications.length,
      notifications: allNotifications,
    },
  };
};

export const setAllNotificationsRead = async (userId: string) => {
  const notificationsUpdateTable = database.updateTable('notifications');

  await notificationsUpdateTable
    .where('userId', '=', userId)
    .where('read', '=', false)
    .set({
      read: true,
    })
    .execute();

  return {
    success: true,
  };
};

export const reportPost = async (postId: string, userId: string) => {
  const insertReportedPostsTable = database.insertInto('reportedPosts');
  const givenPost = await database
    .selectFrom('posts')
    .where('postId', '=', postId)
    .selectAll()
    .executeTakeFirst();

  if (!givenPost) {
    return {
      success: false,
      message: 'The reported post does not exist in our database.',
    };
  }

  await insertReportedPostsTable.values({ postId: postId, reporterId: userId }).execute();

  return {
    success: true,
    message: `Thanks for reporting, we'll analyze carefully the content of the post and we'll get back to you soon. `,
  };
};

export const searchPost = async (searchTerm: string) => {
  const postsTable = database.selectFrom('posts');
  const search = (term: string) => {
    /**
     * Don't worry about SQL Injection
     * KySely will sanitize the interpolated value
     *
     */

    return sql<boolean>`
          to_tsvector('english', ${sql.ref('content')}->>'text' 
          || '' || ${sql.ref('content')}->>'title')  @@ 
          to_tsquery('english', ${term})
        `;
  };
  const foundPostWithGivenCriteria = await postsTable.where(search(searchTerm)).execute();

  return {
    success: true,
    data: foundPostWithGivenCriteria,
  };
};

export const likeAPost = async (postId: string, userId: string) => {
  const postsLikesInsertTable = database.insertInto('postsLikes');
  const postsTable = database.selectFrom('posts');
  const userTable = database.selectFrom('users');
  const likerUser = await userTable.where('id', '=', userId).select('name').executeTakeFirst();
  const postInfo = await postsTable
    .where('postId', '=', postId)
    .select('authorId')
    .executeTakeFirst();

  const notificationsInsertTable = database.insertInto('notifications');

  const updateLikesTable = postsLikesInsertTable
    .values({
      postId: postId,
      likerId: userId,
    })
    .execute();

  const updateNofificationsTable = notificationsInsertTable
    .values([
      {
        userId: postInfo.authorId,
        content: { text: `${likerUser.name.first} liked your post` },
        read: false,
      },
    ])
    .execute();

  Promise.all([updateLikesTable, updateNofificationsTable]);

  return {
    success: true,
    message: 'Post liked successfully!',
  };
};

export const viewPost = async (postId: string, userId: string) => {
  const postsTable = database.selectFrom('posts');
  const postsLikesTable = database.selectFrom('postsLikes');
  const requestedPost = await postsTable
    .where('postId', '=', postId)
    .selectAll()
    .executeTakeFirst();
  const allLikesFromThePost = await postsLikesTable
    .where('postId', '=', postId)
    .selectAll()
    .execute();
  const didUserLikeThatPost = async () => {
    const likes = await postsLikesTable
      .where('postId', '=', postId)
      .where('likerId', '=', userId)
      .selectAll()
      .executeTakeFirst();

    if (likes) return true;
    else return false;
  };

  requestedPost.likesNumber = allLikesFromThePost.length;
  requestedPost.likedByUser = await didUserLikeThatPost();

  return {
    success: true,
    data: requestedPost,
  };
};

export const getPostComments = async (postId: string) => {
  const postsTable = database.selectFrom('comments');
  const requestedPostComments = await postsTable
    .where('postId', '=', postId)
    .innerJoin('users', 'comments.authorId', 'users.id')
    .select(['comments.content', 'users.name', 'users.id', 'users.isOnline'])
    .execute();

  return {
    success: true,
    data: requestedPostComments,
  };
};

export const unlikeAPost = async (postId: string, userId: string) => {
  const postsLikesDeleteTable = database.deleteFrom('postsLikes');
  await postsLikesDeleteTable
    .where('likerId', '=', userId)
    .where('postId', '=', postId)
    .executeTakeFirst();

  return {
    success: true,
    message: 'Post deleted successfully!',
  };
};

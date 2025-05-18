import { Generated } from 'kysely';

export interface userSchema {
  id: Generated<string>;
  email: string;
  name: {
    first: string;
    last: string;
  };
  birthDate: {
    day: number;
    month: number;
    year: number;
  };
  password: string;
  gender: string;
  country: string;
  topWriter: boolean;
  isOnline: boolean;
  profileViews: number;
}

interface followsSchema {
  followerId: string;
  followeeId: string;
}

interface postSchema {
  authorId: string;
  postId: Generated<string>;
  content: {
    title: string;
    text: string;
    attachments: string[];
  };
  likesNumber: number;
  commentsNumber: number;
  // This should be always false in database.
  likedByUser: boolean;
}

export interface commentSchema {
  commentId: Generated<string>;
  authorId: string;
  postId: string;
  content: {
    text: string;
  };
}

interface reportedPostsSchema {
  postId: string;
  reporterId: string;
}

interface notificationsSchema {
  userId: string;
  notificationId: Generated<string>;
  content: {
    text: string;
  };
  read: boolean;
}

interface postsLikesSchema {
  postId: string;
  likerId: string;
}

interface tokensSchemas {
  token: string;
}

export default interface databaseSchema {
  users: userSchema;
  follows: followsSchema;
  posts: postSchema;
  comments: commentSchema;
  notifications: notificationsSchema;
  reportedPosts: reportedPostsSchema;
  postsLikes: postsLikesSchema;
  tokens: tokensSchemas;
}

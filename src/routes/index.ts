import { checkUserAuthorization } from '../auth/index.js';
import {
  deletePost,
  getNotifications,
  postContent,
  findPosts,
  reportIllegalPort,
  likePost,
  unLikePost,
  seePost,
  getAllComentsFromPost,
  getAllPosts,
  allNotificationsFromUserRead,
  addComment,
} from '../feed/index.controllers.js';
import { profileView, updateName } from '../profile/profile.providers.js';
import {
  deleteUsersFromSystem,
  followUser,
  getFollowees,
  getFollowers,
  login,
  register,
  search,
  unFollowUser,
} from '../user/user.providers.js';
import app from './app.js';
import dotenv from 'dotenv';
import cors from '@fastify/cors';
dotenv.config();

const port = Number(process.env.serverPort);
const host = process.env.serverHost;

const startServer = () => {
  app.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['content-type', 'token'],
  });
  // app.addHook('onRequest', checkUserAuthorization);
  app.post('/api/v1/register', register);
  app.post('/api/v1/login', login);
  app.post('/api/v1/users/follow', followUser);
  app.post('/api/v1/users/unfollow', unFollowUser);
  app.get('/api/v1/users/followees', getFollowees);
  app.get('/api/v1/users/followers', getFollowers);
  app.post('/api/v1/users/search', search);
  app.get('/api/v1/users/profile/', profileView);
  app.get('/api/v1/users/notifications', getNotifications);
  app.post('/api/v1/users/notifications/allRead', allNotificationsFromUserRead);
  app.delete('/api/v1/users/', deleteUsersFromSystem);
  app.post('/api/v1/post', postContent);
  app.post('/api/v1/post/like', likePost);
  app.post('/api/v1/post/unlike', unLikePost);
  app.get('/api/v1/post/view', seePost);
  app.post('/api/v1/post/allFromUser', getAllPosts);
  app.post('/api/v1/profile/updateName', updateName);
  app.delete('/api/v1/posts/', deletePost);
  app.get('/api/v1/comments/', getAllComentsFromPost);
  app.post('/api/comment/', addComment);
  app.get('/api/v1/posts/search', findPosts);
  app.post('/api/v1/posts/report', reportIllegalPort);
  app.listen({ port: port }, () => {
    console.log(`The server is up and running! on ${host}:${port}`);
  });
};

startServer();

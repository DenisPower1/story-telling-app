import { FastifyRequest, FastifyReply } from 'fastify';
import {
  getAllNotificationsFromUser,
  getAllUserPosts,
  getPostComments,
  getSuggestedAuthors,
  likeAPost,
  postComment,
  postStory,
  reportPost,
  searchPost,
  setAllNotificationsRead,
  unlikeAPost,
  userDeletePost,
  viewPost,
} from './index.services.js';
import validator from 'validator';
import { commentSchema } from '../config/schemas.js';
import { decodeToken } from '../utils/token.js';
import { runUnAuthorizedRequestReply } from '../utils/helpers.js';
const { isEmpty } = validator;

export const postContent = async (req: FastifyRequest, reply: FastifyReply) => {
  type postType = {
    authorId: string;
    content: {
      title: string;
      text: string;
      attachments: string[];
    };
  };

  const body = req.body as postType;
  const { token } = req.headers as { token: string };
  const decodedToken = decodeToken(token);

  if (!body.content || isEmpty(body.content.text) || isEmpty(body.content.title)) {
    reply.status(400).send({
      success: false,
      message: 'Missing fields.',
    });
  }

  if (decodedToken.userId !== body.authorId) runUnAuthorizedRequestReply(req, reply);

  const answer = await postStory(body);
  const status = answer.success ? 200 : 500;
  reply.status(status).send(answer);
};

export const addComment = async (req: FastifyRequest, reply: FastifyReply) => {
  const body = req.body as commentSchema;
  const { token } = req.headers as { token: string };
  const decodedToken = decodeToken(token);

  if (isEmpty(body.content.text)) {
    reply.status(400).send({
      success: false,
      message: 'Your comment is empty.',
    });
  }

  if (decodedToken.userId !== body.authorId) runUnAuthorizedRequestReply(req, reply);

  const answer = await postComment(body);
  const status = answer.success ? 200 : 500;

  reply.status(status).send(answer);
};

export const deletePost = async (req: FastifyRequest, reply: FastifyReply) => {
  const { userId, postId } = req.body as { postId: string; userId: string };
  const { token } = req.headers as { token: string };
  const decodedToken = decodeToken(token);
  if (isEmpty(postId) || isEmpty(userId)) {
    reply.status(400).send({
      success: false,
      message: 'Either the postId or userId is empty.',
    });
  }

  if (decodedToken.userId !== userId) runUnAuthorizedRequestReply(req, reply);

  const answer = await userDeletePost(postId, userId);
  const status = answer.success ? 200 : 500;

  reply.status(status).send(answer);
};

export const getAllPosts = async (req: FastifyRequest, reply: FastifyReply) => {
  const { userId } = req.body as { userId: string };

  if (isEmpty(userId)) {
    reply.status(400).send({
      success: false,
      message: ' userId is empty.',
    });
  }

  const answer = await getAllUserPosts(userId);
  const status = answer.success ? 200 : 500;
  reply.status(status).send(answer);
};

export const reportIllegalPort = async (req: FastifyRequest, reply: FastifyReply) => {
  const { userId, postId } = req.body as { postId: string; userId: string };
  const { token } = req.headers as { token: string };
  const decodedToken = decodeToken(token);

  if (isEmpty(postId) || isEmpty(userId)) {
    reply.status(400).send({
      success: false,
      message: 'Either the postId or userId is empty.',
    });
  }

  if (decodedToken.userId !== userId) runUnAuthorizedRequestReply(req, reply);

  const answer = await reportPost(postId, userId);
  const status = answer.success ? 200 : 500;

  reply.status(status).send(answer);
};

export const findPosts = async (req: FastifyRequest, reply: FastifyReply) => {
  const queryText = (req.query as { q: string }).q;

  if (isEmpty(queryText) || queryText === void 0) {
    reply.status(400).send({
      success: false,
      message: 'Either the query value is empty or not presented',
    });
  }
  const answer = await searchPost(queryText);
  const status = answer.success ? 200 : 500;

  reply.status(status).send(answer);
};

export const getNotifications = async (req: FastifyRequest, reply: FastifyReply) => {
  const queryValue = (req.query as { userId: string }).userId;

  if (isEmpty(queryValue) || queryValue === void 0) {
    reply.status(400).send({
      success: false,
      message: 'Invalid query',
    });
  }

  const answer = await getAllNotificationsFromUser(queryValue);
  reply.status(200).send(answer);
};

export const getUserRecommendations = async (req: FastifyRequest, reply: FastifyReply) => {
  const queryValue = (req.query as { userId: string }).userId;

  if (isEmpty(queryValue) || queryValue == void 0) {
    reply.status(400).send({
      success: false,
      message: 'Invalid query',
    });
  }

  const answer = await getSuggestedAuthors(queryValue);
  reply.status(200).send(answer);
};

export const allNotificationsFromUserRead = async (req: FastifyRequest, reply: FastifyReply) => {
  const body = req.body as { userId: string };
  const { userId } = body;
  const { token } = req.headers as { token: string };
  const decodedToken = decodeToken(token);

  if (isEmpty(userId) || userId == void 0) {
    reply.status(400).send({
      success: false,
      message: 'Invalid userId field',
    });
  }

  if (decodedToken.userId !== userId) runUnAuthorizedRequestReply(req, reply);

  const answer = await setAllNotificationsRead(userId);
  const status = answer.success ? 200 : 500;
  reply.status(status).send(answer);
};

export const seePost = async (req: FastifyRequest, reply: FastifyReply) => {
  const body = req.query as { viewerId: string; postId: string };
  const { viewerId, postId } = body;

  const answer = await viewPost(postId, viewerId);
  const status = answer.success ? 200 : 500;
  reply.status(status).send(answer);
};

export const likePost = async (req: FastifyRequest, reply: FastifyReply) => {
  const body = req.body as { likerId: string; postId: string };
  const { likerId, postId } = body;
  const { token } = req.headers as { token: string };
  const decodedToken = decodeToken(token);

  if (!likerId || !postId) {
    reply.status(400).send({
      success: false,
      message: 'Invalid likerId or postId',
    });
  }

  if (decodedToken.userId !== likerId) runUnAuthorizedRequestReply(req, reply);

  const answer = await likeAPost(postId, likerId);
  const status = answer.success ? 200 : 500;
  reply.status(status).send(answer);
};

export const unLikePost = async (req: FastifyRequest, reply: FastifyReply) => {
  const body = req.body as { likerId: string; postId: string };
  const { likerId, postId } = body;

  if (!likerId || !postId) {
    reply.status(400).send({
      success: false,
      message: 'Invalid likerId or postId',
    });
  }

  const answer = await unlikeAPost(postId, likerId);
  const status = answer.success ? 200 : 500;
  reply.status(status).send(answer);
};

export const getAllComentsFromPost = async (req: FastifyRequest, reply: FastifyReply) => {
  const queryValue = (req.query as { postId: string }).postId;
  if (isEmpty(queryValue) || queryValue == void 0) {
    reply.status(400).send({
      success: false,
      message: 'Invalid request: postId query string must be present',
    });
  }

  const answer = await getPostComments(queryValue);
  const status = answer.success ? 200 : 500;
  reply.status(status).send(answer);
};

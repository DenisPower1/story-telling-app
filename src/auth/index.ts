import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyToken } from '../utils/token.js';

export const checkUserAuthorization = async (req: FastifyRequest, reply: FastifyReply) => {
  const token = req.headers.token as string;
  const routesThatNeedAuthorizations = new Set([
    '/api/v1/users/follow',
    '/api/v1/users/unfollow',
    '/api/v1/users/followees',
    '/api/v1/users/followers',
    '/api/v1/users/search',
    '/api/v1/users/profile/',
    '/api/v1/users/notifications',
    '/api/v1/users/notifications/allRead',
    '/api/v1/users/',
    '/api/v1/v1/post',
    '/api/v1/v1/post/like',
    '/api/v1/v1/post/unlike',
    '/api/v1/v1/post/view',
    '/api/v1/profile/updateName',
    '/api/v1/posts/',
    '/api/v1/comments/',
    '/api/v1/comment',
    '/api/v1/osts/search',
    '/api/v1/posts/report',
  ]);

  const requestedRoute = req.url;
  const requestMethod = req.method;
  if (routesThatNeedAuthorizations.has(requestedRoute)) {
    const inValidToken = !(await verifyToken(token));
    const contentType = req.headers['content-type'];
    const requireBodyMethods = new Set(['POST', 'PUT', 'DELETE']);

    if (
      requireBodyMethods.has(requestMethod) &&
      (contentType !== 'application/json' || !contentType)
    ) {
      reply.status(400).send({
        success: false,
        message: 'Invalid content-type header or it is not present',
      });
    }

    if (inValidToken) {
      reply.status(401).send({
        success: false,
        message: 'Token expired or invalid.',
      });
    }
  }
};

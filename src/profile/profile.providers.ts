import { FastifyRequest, FastifyReply } from 'fastify';
import {
  updatePassWord,
  updateUserMame,
  userViewOwnProfile,
  viewProfile,
} from './profile.services.js';
import validator from 'validator';
import { decodeToken } from '../utils/token.js';
import { runUnAuthorizedRequestReply } from '../utils/helpers.js';
const { isEmpty } = validator;

export const updatePass = async (req: FastifyRequest, reply: FastifyReply) => {
  const body = req.body as { oldPassWord: string; newPassWord: string; userId: string };
  const { token } = req.headers as { token: string };
  const { oldPassWord, newPassWord, userId } = body;
  const decodedToken = decodeToken(token);

  if (isEmpty(oldPassWord) || isEmpty(newPassWord) || isEmpty(userId)) {
    reply.status(400).send({
      success: false,
      message: 'At least one of the fields is empty.',
    });
  }

  if (decodedToken.userId !== userId) runUnAuthorizedRequestReply(req, reply);

  const answer = await updatePassWord(body);
  const status = answer.success ? 200 : 500;
  reply.status(status).send(answer);
};

export const updateName = async (req: FastifyRequest, reply: FastifyReply) => {
  const body = req.body as { firstName: string; lastName: string; userId: string };
  const { firstName, lastName, userId } = body;
  const { token } = req.headers as { token: string };
  const decodedToken = decodeToken(token);

  if (isEmpty(firstName) || isEmpty(lastName) || isEmpty(userId)) {
    reply.status(400).send({
      success: false,
      message: 'At least one of the fields is empty.',
    });
  }

  if (decodedToken.userId !== userId) runUnAuthorizedRequestReply(req, reply);

  const answer = await updateUserMame(userId, { first: firstName, last: lastName });
  const status = answer.success ? 200 : 500;
  reply.status(status).send(answer);
};

export const profileView = async (req: FastifyRequest, reply: FastifyReply) => {
  const body = req.query as { targetUserId: string; viewerId?: string };
  const { targetUserId, viewerId } = body;

  if (isEmpty(targetUserId)) {
    reply.status(400).send({
      success: false,
      message: 'targetUserId query was not provided',
    });
  }

  let answer: {
    success: boolean;
    data: object;
  };

  if (!isEmpty(viewerId) || targetUserId !== viewerId)
    answer = await viewProfile(targetUserId, viewerId);
  else answer = await userViewOwnProfile(targetUserId);
  const status = answer.success ? 200 : 500;
  reply.status(status).send(answer);
};

import { FastifyRequest, FastifyReply } from 'fastify';
import { userSchema } from '../config/schemas.js';
import validator from 'validator';
import {
  deleteUser,
  followAUser,
  getAllFollowees,
  getAllFollowers,
  logUser,
  registerUser,
  searchUser,
  unfollowAUser,
} from './user.services.js';
import { decodeToken } from '../utils/token.js';
import { runUnAuthorizedRequestReply } from '../utils/helpers.js';
const { isEmail, isEmpty, isStrongPassword, normalizeEmail } = validator;

export const register = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = req.body as userSchema;
  const {
    name: { first, last },
    email,
    birthDate,
    gender,
    country,
    password,
  } = user;

  const genders = new Set(['Male', 'Female']);
  const invalidData =
    isEmpty(first) || isEmpty(last) || !isEmail(email) || !genders.has(gender) || isEmpty(country);
  const notStrongPassWord = !isStrongPassword(password, {
    minLength: 8,
    minNumbers: 2,
    minSymbols: 2,
    minLowercase: 4,
    minUppercase: 1,
  });

  const invalidBirthDate = () => {
    const { day, month, year } = birthDate;
    if (day > 31 || month > 12 || year >= 2020) return true;
    else return false;
  };

  if (invalidData) {
    reply.status(400).send({
      success: false,
      message: 'User is providing invalid values for required fields.',
    });
  } else if (notStrongPassWord) {
    reply.status(403).send({
      success: false,
      message:
        'Your password is not strong enough, it must be at least 8 characters long, with 2 numbers, 2 symbols, 4 lowercase character and at least 1 upper case character.',
    });
  } else if (invalidBirthDate()) {
    reply.status(403).send({
      success: false,
      message: "Either the date your provided is invalid or you're too young to use our app.",
    });
  } else {
    user.email = String(normalizeEmail(user.email));
    const answer = await registerUser(user);
    const status = answer.success ? 200 : 500;
    reply.status(status).send(answer);
  }
};

export const login = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = req.body as userSchema;
  const { email } = user;

  if (!isEmail(email)) {
    reply.status(400).send({
      success: false,
      message: 'The email provided is not valid',
    });
  }

  const answer = await logUser(user);
  const status = answer.success ? 200 : 403;
  reply.status(status).send(answer);
};

export const search = async (req: FastifyRequest, reply: FastifyReply) => {
  const queryText = (req.query as { q: string }).q;

  if (queryText == void 0 || isEmpty(queryText)) {
    reply.status(400).send({
      success: false,
      message: 'Your query text is either empty or not present',
    });
  }

  const answer = await searchUser(queryText);
  reply.status(200).send(answer);
};

export const deleteUsersFromSystem = async (req: FastifyRequest, reply: FastifyReply) => {
  const body = req.body as { userId: string };
  const { token } = req.headers as { token: string };
  const { userId } = body;
  const decodedToken = decodeToken(token);

  if (isEmpty(userId)) {
    reply.status(400).send({
      success: false,
      message: 'Invalid userId to delete',
    });
  }

  if (decodedToken.userId !== userId) runUnAuthorizedRequestReply(req, reply);

  const answer = await deleteUser(userId);
  const status = answer.success ? 200 : 500;
  reply.status(status).send(answer);
};

export const getFollowers = async (req: FastifyRequest, reply: FastifyReply) => {
  const queryValue = (req.query as { userId: string }).userId;

  if (isEmpty(queryValue) || queryValue == void 0) {
    reply.status(400).send({
      success: false,
      message: 'userId query string required',
    });
  }

  const answer = await getAllFollowers(queryValue);
  const status = answer.success ? 200 : 500;
  reply.status(status).send(answer);
};

export const getFollowees = async (req: FastifyRequest, reply: FastifyReply) => {
  const queryValue = (req.query as { userId: string }).userId;

  if (isEmpty(queryValue) || queryValue == void 0) {
    reply.status(400).send({
      success: false,
      message: 'userId query string required.',
    });
  }

  const answer = await getAllFollowees(queryValue);
  reply.status(200).send(answer);
};

export const followUser = async (req: FastifyRequest, reply: FastifyReply) => {
  const body = req.body as { followerId: string; followeeId: string };
  const { followeeId, followerId } = body;
  const { token } = req.headers as { token: string };
  const decodedToken = decodeToken(token);

  if (isEmpty(followeeId) || isEmpty(followerId)) {
    reply.status(400).send({
      success: false,
      message: 'Either followeeId or followerId is empty.',
    });
  }

  if (decodedToken.userId !== followerId) runUnAuthorizedRequestReply(req, reply);

  const answer = await followAUser(followeeId, followerId);
  const status = answer.success ? 200 : 500;
  reply.status(status).send(answer);
};

export const unFollowUser = async (req: FastifyRequest, reply: FastifyReply) => {
  const body = req.body as { followerId: string; followeeId: string };
  const { followeeId, followerId } = body;
  const { token } = req.headers as { token: string };
  const decodedToken = decodeToken(token);

  if (isEmpty(followeeId) || isEmpty(followerId)) {
    reply.status(400).send({
      success: false,
      message: 'Either followeeId or followerId is empty.',
    });
  }

  if (decodedToken.userId !== followerId) runUnAuthorizedRequestReply(req, reply);

  const answer = await unfollowAUser(followeeId, followerId);
  const status = answer.success ? 200 : 500;
  reply.status(status).send(answer);
};

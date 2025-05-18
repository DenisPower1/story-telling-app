import { FastifyReply, FastifyRequest } from 'fastify';

export const runUnAuthorizedRequestReply = (req: FastifyRequest, reply: FastifyReply) => {
  reply.status(401).send({
    success: false,
    message: 'unnauthorized request.',
  });
};

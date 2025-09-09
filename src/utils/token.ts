import pkg from 'jsonwebtoken';
import dotenv from 'dotenv';
import database from '../config/db.js';
const { sign, verify, decode } = pkg;

dotenv.config();

const secretKey = process.env.jsonWebTokenSecretKey;

export const verifyToken = async (token: string) => {
  const tokensTable = database.selectFrom('tokens');
  const deleteTokensTable = database.deleteFrom('tokens');
  const retrievedDoc = await tokensTable.where('token', '=', token).selectAll().executeTakeFirst();
  const givenToken = retrievedDoc?.token;

  if (givenToken) {
    try {
      const _token = verify(givenToken, secretKey);
      return _token;
    } catch (err) {
      console.log(err);
      await deleteTokensTable.where('token', '=', token).execute();
      return false;
    }
  }
  return false;
};

export const createToken = (payload: object) => {
  const token = sign(payload, secretKey, { expiresIn: '30m' });
  return token;
};

export const decodeToken = (token: string) => {
  const decodedToken = decode(token, { json: true });

  return decodedToken;
};

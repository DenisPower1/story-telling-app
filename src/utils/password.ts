import { compare, hash, getSalt } from 'bcryptjs';

export const encryptPassWord = async (unhasedPassWord: string) => {
  const salt = getSalt('');

  return await hash(unhasedPassWord, salt);
};

export const isSamePassWord = async (unhasedPassWord: string, hashedPassWord: string) => {
  return await compare(unhasedPassWord, hashedPassWord);
};
